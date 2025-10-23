
const TOKEN_IMPORT_SRC = '@/styles/tokens';
const UTILS_IMPORT_SRC = '@/lib/utils';

const SIZE_MAP = {
  'rounded-none': 'none',
  'rounded-sm': 'sm',
  'rounded': 'md', // tailwind "rounded" = ~md
  'rounded-md': 'md',
  'rounded-lg': 'lg',
  'rounded-xl': 'xl',
  'rounded-2xl': '2xl',
  'rounded-3xl': '3xl',
  'rounded-full': 'full',
};

// Heuristics to pick componentRadius.<variant>
function inferVariant(filePath, opening) {
  const p = filePath.toLowerCase();
  const name = opening.name;
  const tag =
    name.type === 'JSXIdentifier' ? String(name.name).toLowerCase() : '';

  if (p.includes('/card') || tag === 'article' || tag === 'section') return 'card';
  if (p.includes('/button') || tag === 'button') return 'button';
  if (p.includes('/input') || tag === 'input' || tag === 'textarea') return 'input';
  if (p.includes('/avatar')) return 'avatar';
  // default: let’s try card as sensible default for containers
  if (tag === 'div') return 'card';
  return null;
}

function ensureImport(j, root, source, specNames) {
  const body = root.get().node.program.body;
  const decl = body.find((n) => n.type === 'ImportDeclaration' && n.source.value === source);
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
    decl.specifiers.filter((s) => s.type === 'ImportSpecifier').map((s) => s.imported.name)
  );
  const extras = specNames.filter((n) => !present.has(n));
  if (extras.length) {
    decl.specifiers.push(...extras.map((n) => j.importSpecifier(j.identifier(n))));
  }
}

function parseClassesFromAttr(j, classAttrValue) {
  if (!classAttrValue) return { raw: [], expr: null };
  if (classAttrValue.type === 'StringLiteral' || classAttrValue.type === 'Literal') {
    return { raw: (classAttrValue.value || '').split(/\s+/).filter(Boolean), expr: null };
  }
  if (classAttrValue.type === 'JSXExpressionContainer') {
    const expr = classAttrValue.expression;
    if (expr.type === 'StringLiteral' || expr.type === 'Literal') {
      return { raw: (expr.value || '').split(/\s+/).filter(Boolean), expr: null };
    }
    return { raw: [], expr: classAttrValue };
  }
  return { raw: [], expr: null };
}

function rebuildClassAttr(j, classAttr, keptClasses, extraExpr) {
  if (extraExpr) {
    if (keptClasses.length === 0) {
      classAttr.value = extraExpr;
      return;
    }
    classAttr.value = j.jsxExpressionContainer(
      j.callExpression(j.identifier('cn'), [
        j.literal(keptClasses.join(' ')),
        extraExpr.expression ?? extraExpr,
      ])
    );
    return;
  }
  classAttr.value = j.literal(keptClasses.join(' '));
}

function getOrCreateStyleObject(j, opening) {
  const styleAttr = opening.attributes?.find(
    (a) => a.type === 'JSXAttribute' && a.name?.name === 'style'
  );
  if (!styleAttr) {
    const obj = j.objectExpression([]);
    opening.attributes.push(
      j.jsxAttribute(j.jsxIdentifier('style'), j.jsxExpressionContainer(obj))
    );
    return obj;
  }
  if (styleAttr.value?.type === 'JSXExpressionContainer' && styleAttr.value.expression.type === 'ObjectExpression') {
    return styleAttr.value.expression;
  }
  const obj = j.objectExpression([]);
  styleAttr.value = j.jsxExpressionContainer(obj);
  return obj;
}

function upsertStyleProp(j, styleObj, key, memberExpr) {
  const keyId = j.identifier(key);
  const existing = styleObj.properties.find(
    (p) => p.type === 'ObjectProperty' && p.key.type === 'Identifier' && p.key.name === key
  );
  if (existing) {
    existing.value = memberExpr;
  } else {
    styleObj.properties.push(j.objectProperty(keyId, memberExpr));
  }
}

function tokenAccessToMemberExpr(j, token) {
  // e.g., "componentRadius.values.lg"
  const parts = token.split('.');
  let expr = j.identifier(parts[0]);
  for (let i = 1; i < parts.length; i++) {
    expr = j.memberExpression(expr, j.identifier(parts[i]));
  }
  return expr;
}

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  const filePath = fileInfo.path.replace(/\\/g, '/');

  let changed = false;

  root.find(j.JSXOpeningElement).forEach((p) => {
    const opening = p.node;
    const attrs = opening.attributes || [];
    const classAttr = attrs.find((a) => a.type === 'JSXAttribute' && a.name?.name === 'className');

    const { raw: rawClasses, expr: complexExpr } = classAttr
      ? parseClassesFromAttr(j, classAttr.value)
      : { raw: [], expr: null };

    const toRemove = [];
    let size = null;
    for (const cls of rawClasses) {
      if (SIZE_MAP[cls]) {
        size = SIZE_MAP[cls];
        toRemove.push(cls);
        // لا تكسر loop — خذ آخر واحدة إن كثرت
      }
    }
    if (!size) return;

    const variant = inferVariant(filePath, opening);

    if (variant) {
      // استخدم className={cn(componentRadius.variant, ...)}
      const compExpr = tokenAccessToMemberExpr(j, `componentRadius.${variant}`);
      if (!classAttr) {
        opening.attributes.push(
          j.jsxAttribute(
            j.jsxIdentifier('className'),
            j.jsxExpressionContainer(compExpr)
          )
        );
      } else {
        const kept = rawClasses.filter((c) => !toRemove.includes(c));
        classAttr.value = j.jsxExpressionContainer(
          j.callExpression(j.identifier('cn'), [
            compExpr,
            kept.length ? j.literal(kept.join(' ')) : null,
            complexExpr ? (complexExpr.expression ?? complexExpr) : null,
          ].filter(Boolean))
        );
      }
      changed = true;
    } else {
      // Fallback: style={{ borderRadius: componentRadius.values[size] }}
      const styleObj = getOrCreateStyleObject(j, opening);
      const brExpr = tokenAccessToMemberExpr(j, `componentRadius.values.${size}`);
      upsertStyleProp(j, styleObj, 'borderRadius', brExpr);

      if (classAttr) {
        const kept = rawClasses.filter((c) => !toRemove.includes(c));
        rebuildClassAttr(j, classAttr, kept, complexExpr);
      }
      changed = true;
    }
  });

  if (changed) {
    ensureImport(j, root, TOKEN_IMPORT_SRC, ['componentRadius']);
    ensureImport(j, root, UTILS_IMPORT_SRC, ['cn']);
  }

  return changed ? root.toSource({ quote: 'single', trailingComma: true }) : null;
};
