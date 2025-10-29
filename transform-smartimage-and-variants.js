

const CONTEXT_RULES = [
  { test: /(?:^|\/)(profile|user|account)(?:\/|$)/i, blur: 'primary' },
  { test: /(?:^|\/)(academy|course|lesson)(?:\/|$)/i, blur: 'secondary' },
  { test: /(?:^|\/)(shop|store|product|cart)(?:\/|$)/i, blur: 'primary' },
];

function inferBlurTypeFromPath(filePath) {
  for (const r of CONTEXT_RULES) {
    if (r.test.test(filePath)) return r.blur;
  }
  return 'light';
}

function hasAttr(opening, name) {
  return opening.attributes?.some(
    (a) => a.type === 'JSXAttribute' && a.name?.name === name
  );
}

function addOrUpdateAttr(j, opening, name, valueNode) {
  const existing = opening.attributes?.find(
    (a) => a.type === 'JSXAttribute' && a.name?.name === name
  );
  if (existing) {
    existing.value = valueNode;
  } else {
    opening.attributes.push(j.jsxAttribute(j.jsxIdentifier(name), valueNode));
  }
}

function ensureImport(j, root, source, specNames) {
  const body = root.get().node.program.body;
  const imports = body.filter((n) => n.type === 'ImportDeclaration');
  const decl = imports.find((d) => d.source?.value === source);

  if (!decl) {
    body.unshift(
      j.importDeclaration(
        specNames.map((n) => j.importSpecifier(j.identifier(n))),
        j.literal(source)
      )
    );
    return;
  }

  const present = new Set(
    decl.specifiers
      .filter((s) => s.type === 'ImportSpecifier')
      .map((s) => s.imported.name)
  );
  const extras = specNames.filter((n) => !present.has(n));
  if (extras.length) {
    decl.specifiers.push(
      ...extras.map((n) => j.importSpecifier(j.identifier(n)))
    );
  }
}

function classNameToCn(j, value, variantKey, removePatterns = []) {
  // value: JSXAttribute.value
  // variantKey: 'card.base' | 'card.elevated'
  // removePatterns: regex patterns to strip from raw classes
  const cnCall = (rawStrLit, existingExpr) => {
    if (existingExpr) {
      return j.jsxExpressionContainer(
        j.callExpression(j.identifier('cn'), [
          j.memberExpression(
            j.memberExpression(
              j.identifier('componentVariants'),
              j.identifier('card')
            ),
            j.identifier(variantKey === 'card.elevated' ? 'elevated' : 'base')
          ),
          existingExpr.expression ?? existingExpr,
        ])
      );
    }
    // Normalize/clean classes
    let raw = rawStrLit.value;
    for (const rx of removePatterns) {
      raw = raw.replace(rx, ' ');
    }
    raw = raw.replace(/\s+/g, ' ').trim();

    return j.jsxExpressionContainer(
      j.callExpression(j.identifier('cn'), [
        j.memberExpression(
          j.memberExpression(
            j.identifier('componentVariants'),
            j.identifier('card')
          ),
          j.identifier(variantKey === 'card.elevated' ? 'elevated' : 'base')
        ),
        j.literal(raw),
      ])
    );
  };

  if (!value) return value;

  if (value.type === 'StringLiteral' || value.type === 'Literal') {
    return cnCall(value, null);
  }

  if (value.type === 'JSXExpressionContainer') {
    const expr = value.expression;

    // If already cn(componentVariants...), skip
    if (
      expr.type === 'CallExpression' &&
      expr.callee.name === 'cn' &&
      expr.arguments.some(
        (a) =>
          a.type === 'MemberExpression' &&
          a.object?.object?.name === 'componentVariants'
      )
    ) {
      return value; // already normalized
    }

    return cnCall({ value: '' }, value);
  }

  return value;
}

module.exports = function transformer(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  const filePath = fileInfo.path.replace(/\\/g, '/');

  let changed = false;

  // 1) SmartImage codemod
  root
    .find(j.JSXOpeningElement)
    .filter((p) => {
      const n = p.node.name;
      return (
        (n.type === 'JSXIdentifier' && n.name === 'SmartImage') ||
        (n.type === 'JSXMemberExpression' && n.property?.name === 'SmartImage')
      );
    })
    .forEach((p) => {
      const opening = p.node;

      const hasBlurType = hasAttr(opening, 'blurType');
      const hasAutoQuality = hasAttr(opening, 'autoQuality');
      const hasWidth = hasAttr(opening, 'width');
      const hasFill = hasAttr(opening, 'fill');

      // Add blurType if missing
      if (!hasBlurType) {
        const blur = inferBlurTypeFromPath(filePath);
        addOrUpdateAttr(
          j,
          opening,
          'blurType',
          j.stringLiteral(String(blur))
        );
        changed = true;
      }

      // Add autoQuality={true} only if width exists and fill NOT exists
      if (!hasAutoQuality && hasWidth && !hasFill) {
        addOrUpdateAttr(j, opening, 'autoQuality', j.jsxExpressionContainer(j.booleanLiteral(true)));
        changed = true;
      }
    });

  // 2) Component Variants for cards
  // تعريف أنماط معقولة بدل regex fragile على كل شيء
  const likelyCardClasses = [
    /bg-white\b.*\bdark:bg-(?:neutral|slate|zinc)-\d+\b.*\bborder\b/i,
    /\brounded-2xl\b.*\bshadow(?:-\w+)?\b/i,
  ];

  root.find(j.JSXOpeningElement).forEach((p) => {
    const opening = p.node;
    const attrs = opening.attributes || [];
    const classAttr = attrs.find(
      (a) => a.type === 'JSXAttribute' && a.name?.name === 'className'
    );
    if (!classAttr) return;

    // Extract raw text if available
    let rawClass = '';
    if (classAttr.value?.type === 'StringLiteral' || classAttr.value?.type === 'Literal') {
      rawClass = classAttr.value.value || '';
    } else if (
      classAttr.value?.type === 'JSXExpressionContainer' &&
      (classAttr.value.expression.type === 'StringLiteral' ||
        classAttr.value.expression.type === 'Literal')
    ) {
      rawClass = classAttr.value.expression.value || '';
    } else {
      // For complex expressions, we will still wrap with cn(..., expr)
      rawClass = '';
    }

    // Already standardized?
    const alreadyComponentVariants =
      classAttr.value?.type === 'JSXExpressionContainer' &&
      classAttr.value.expression.type === 'CallExpression' &&
      classAttr.value.expression.callee.name === 'cn' &&
      classAttr.value.expression.arguments.some(
        (a) =>
          a.type === 'MemberExpression' &&
          a.object?.object?.name === 'componentVariants'
      );

    if (alreadyComponentVariants) return;

    const isCardBase = likelyCardClasses[0].test(rawClass);
    const isElevated = likelyCardClasses[1].test(rawClass);

    if (!isCardBase && !isElevated) return;

    // Remove patterns we don’t want duplicated
    const remove = [
      /\bbg-white\b/gi,
      /\bdark:bg-(?:neutral|slate|zinc)-\d+\b/gi,
      /\bborder(?:-\w+)*\b/gi,
      /\brounded-2xl\b/gi,
      /\bshadow(?:-\w+)?\b/gi,
    ];

    classAttr.value = classNameToCn(
      j,
      classAttr.value,
      isElevated ? 'card.elevated' : 'card.base',
      remove
    );
    changed = true;
  });

  // Ensure needed imports if changed
  if (changed) {
    ensureImport(j, root, '@/shared/components/ui/variants', ['componentVariants', 'mergeVariants']);
    ensureImport(j, root, '@/lib/utils', ['cn']);
  }
  return changed ? root.toSource({ quote: 'single', trailingComma: true }) : null;
};

