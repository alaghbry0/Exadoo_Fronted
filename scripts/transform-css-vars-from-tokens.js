

const UTILS_IMPORT_SRC = '@/lib/utils';

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

function parseTokensMemberPath(j, node) {
  // matches colors.text.primary, colors.bg.primary, colors.border.default
  // return string like 'text.primary'
  if (node.type !== 'MemberExpression') return null;

  function unwrap(mem) {
    const parts = [];
    let cur = mem;
    while (cur && cur.type === 'MemberExpression') {
      const prop = cur.property.type === 'Identifier' ? cur.property.name : null;
      if (!prop) return null;
      parts.unshift(prop);
      if (cur.object.type === 'Identifier') {
        parts.unshift(cur.object.name);
        break;
      } else {
        cur = cur.object;
      }
    }
    return parts.join('.');
  }

  const full = unwrap(node);
  if (!full) return null;
  if (!full.startsWith('colors.')) return null;
  return full.slice('colors.'.length); // e.g., "text.primary"
}

function getOrCreateClassAttr(j, opening) {
  let classAttr = opening.attributes?.find(
    (a) => a.type === 'JSXAttribute' && a.name?.name === 'className'
  );
  if (!classAttr) {
    classAttr = j.jsxAttribute(j.jsxIdentifier('className'), j.literal(''));
    opening.attributes.push(classAttr);
  }
  return classAttr;
}

function readClassParts(j, classAttr) {
  if (!classAttr || !classAttr.value) return { parts: [], expr: null };
  const v = classAttr.value;
  if (v.type === 'StringLiteral' || v.type === 'Literal') {
    return { parts: (v.value || '').split(/\s+/).filter(Boolean), expr: null };
  }
  if (v.type === 'JSXExpressionContainer') {
    const expr = v.expression;
    if (expr.type === 'StringLiteral' || expr.type === 'Literal') {
      return { parts: (expr.value || '').split(/\s+/).filter(Boolean), expr: null };
    }
    return { parts: [], expr: v };
  }
  return { parts: [], expr: null };
}

function writeClassParts(j, classAttr, parts, expr) {
  if (expr) {
    if (parts.length === 0) {
      classAttr.value = expr;
      return;
    }
    classAttr.value = j.jsxExpressionContainer(
      j.callExpression(j.identifier('cn'), [
        j.literal(parts.join(' ')),
        expr.expression ?? expr,
      ])
    );
    return;
  }
  classAttr.value = j.literal(parts.join(' '));
}

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  let changed = false;

  root.find(j.JSXOpeningElement).forEach((p) => {
    const opening = p.node;

    // locate style object
    const styleAttr = opening.attributes?.find(
      (a) => a.type === 'JSXAttribute' && a.name?.name === 'style'
    );
    if (!styleAttr || styleAttr.value?.type !== 'JSXExpressionContainer') return;
    const styleObj = styleAttr.value.expression;
    if (!styleObj || styleObj.type !== 'ObjectExpression') return;

    // scan style props
    const toRemove = [];
    const toAddClasses = [];

    for (const prop of styleObj.properties) {
      if (prop.type !== 'ObjectProperty') continue;
      const key = prop.key.type === 'Identifier' ? prop.key.name : null;
      if (!key) continue;

      // only handle color/backgroundColor/borderColor
      if (!['color', 'backgroundColor', 'borderColor'].includes(key)) continue;

      const val = prop.value;
      if (val.type === 'MemberExpression') {
        const path = parseTokensMemberPath(j, val); // e.g., 'text.primary'
        if (!path) continue;

        const className =
          key === 'color'
            ? `text-[var(--color-${path.replace(/\./g, '-')})]`
            : key === 'backgroundColor'
            ? `bg-[var(--color-${path.replace(/\./g, '-')})]`
            : `border-[var(--color-${path.replace(/\./g, '-')})]`;

        toAddClasses.push(className);
        toRemove.push(prop);
      }
    }

    if (toAddClasses.length) {
      // remove converted props
      styleObj.properties = styleObj.properties.filter((p2) => !toRemove.includes(p2));
      // if style object becomes empty, drop it
      if (styleObj.properties.length === 0) {
        const idx = opening.attributes.indexOf(styleAttr);
        if (idx >= 0) opening.attributes.splice(idx, 1);
      }

      // add classes
      const classAttr = getOrCreateClassAttr(j, opening);
      const { parts, expr } = readClassParts(j, classAttr);
      const merged = Array.from(new Set([...parts, ...toAddClasses]));
      writeClassParts(j, classAttr, merged, expr);

      changed = true;
    }
  });

  if (changed) {
    ensureImport(j, root, UTILS_IMPORT_SRC, ['cn']);
  }

  return changed ? root.toSource({ quote: 'single', trailingComma: true }) : null;
};
س