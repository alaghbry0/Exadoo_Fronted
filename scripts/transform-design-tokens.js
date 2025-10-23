
const TOKEN_IMPORT_SRC = '@/styles/tokens';
const UTILS_IMPORT_SRC = '@/lib/utils';

// -------- Mapping Tables (وسّعها براحتك) --------

// Tailwind text colors → tokens.colors.text
const TEXT_COLOR_MAP = {
  'text-gray-900': 'colors.text.primary',
  'dark:text-white': 'colors.text.inverse',
  'text-gray-600': 'colors.text.secondary',
  'dark:text-gray-400': 'colors.text.muted',
  'text-white': 'colors.text.inverse',
};

// Tailwind bg colors → tokens.colors.bg
const BG_COLOR_MAP = {
  'bg-white': 'colors.bg.primary',
  'dark:bg-neutral-900': 'colors.bg.primary', // إن كان عندك تفريق بين primary/elevated عدله
  'bg-neutral-50': 'colors.bg.subtle',
};

// Tailwind border colors → tokens.colors.border
const BORDER_COLOR_MAP = {
  'border-gray-200': 'colors.border.default',
  'dark:border-neutral-800': 'colors.border.default',
  'border-neutral-300': 'colors.border.subtle',
};

// Typography: استبدال text-sizes + weights إلى classes من tokens.typography
// ملاحظة: هذه أمثلة، طابقها مع تعريفك الحقيقي في '@/styles/tokens'
const TYPOGRAPHY_CLASS_MAP = {
  'text-3xl font-bold': 'typography.heading.xl',
  'text-2xl font-bold': 'typography.heading.lg',
  'text-xl font-semibold': 'typography.heading.md',
  'text-sm': 'typography.body.sm',
  'text-base': 'typography.body.md',
};

// Spacing: p-4, mb-6, gap-3 → style مع spacing[n]
const SPACING_CLASS_TO_PROP = {
  // padding
  'p-0': { styleKey: 'padding', token: 'spacing[0]' },
  'p-1': { styleKey: 'padding', token: 'spacing[1]' },
  'p-2': { styleKey: 'padding', token: 'spacing[2]' },
  'p-3': { styleKey: 'padding', token: 'spacing[3]' },
  'p-4': { styleKey: 'padding', token: 'spacing[4]' },
  'p-5': { styleKey: 'padding', token: 'spacing[5]' },
  'p-6': { styleKey: 'padding', token: 'spacing[6]' },

  // margin-bottom
  'mb-1': { styleKey: 'marginBottom', token: 'spacing[1]' },
  'mb-2': { styleKey: 'marginBottom', token: 'spacing[2]' },
  'mb-3': { styleKey: 'marginBottom', token: 'spacing[3]' },
  'mb-4': { styleKey: 'marginBottom', token: 'spacing[4]' },
  'mb-5': { styleKey: 'marginBottom', token: 'spacing[5]' },
  'mb-6': { styleKey: 'marginBottom', token: 'spacing[6]' },

  // gap
  'gap-1': { styleKey: 'gap', token: 'spacing[1]' },
  'gap-2': { styleKey: 'gap', token: 'spacing[2]' },
  'gap-3': { styleKey: 'gap', token: 'spacing[3]' },
  'gap-4': { styleKey: 'gap', token: 'spacing[4]' },
  'gap-6': { styleKey: 'gap', token: 'spacing[6]' },
};

// Shadows: إمّا نصنفها كـ card class أو elevation رقمية
const SHADOW_CLASS_MAP = {
  'shadow-sm': { class: 'shadowClasses.card' }, // عدّل حسب نظامك
  'shadow-md': { class: 'shadowClasses.card' },
  'shadow-lg': { class: 'shadowClasses.card' },
};

// -------- Helpers --------
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
  // حالة style inline غريبة: نستبدلها بكائن
  const obj = j.objectExpression([]);
  styleAttr.value = j.jsxExpressionContainer(obj);
  return obj;
}

function upsertStyleProp(j, styleObj, key, tokenAccess) {
  // tokenAccess: e.g. 'colors.text.primary' → MemberExpression
  const keyId = j.identifier(key);
  const valueExpr = tokenAccessToMemberExpr(j, tokenAccess);
  const existing = styleObj.properties.find(
    (p) => p.type === 'ObjectProperty' && p.key.type === 'Identifier' && p.key.name === key
  );
  if (existing) {
    existing.value = valueExpr;
  } else {
    styleObj.properties.push(j.objectProperty(keyId, valueExpr));
  }
}

function tokenAccessToMemberExpr(j, token) {
  // 'colors.text.primary' → colors.text.primary (MemberExpression)
  const parts = token.replace(/\[(\d+)\]/g, '.$1').split('.'); // handle spacing[4]
  let expr = j.identifier(parts[0]);
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (/^\d+$/.test(part)) {
      expr = j.memberExpression(expr, j.numericLiteral(Number(part)), true);
    } else {
      expr = j.memberExpression(expr, j.identifier(part));
    }
  }
  return expr;
}

function parseClassesFromAttr(j, classAttrValue) {
  // returns { raw: string[], expr: JSXExpressionContainer|null }
  if (!classAttrValue) return { raw: [], expr: null };

  if (classAttrValue.type === 'StringLiteral' || classAttrValue.type === 'Literal') {
    return { raw: (classAttrValue.value || '').split(/\s+/).filter(Boolean), expr: null };
  }
  if (classAttrValue.type === 'JSXExpressionContainer') {
    const expr = classAttrValue.expression;
    if (expr.type === 'StringLiteral' || expr.type === 'Literal') {
      return { raw: (expr.value || '').split(/\s+/).filter(Boolean), expr: null };
    }
    // تعبير معقّد (cn/clsx/conditional) — نخليه كما هو، ونشتغل فقط على الألوان/spacing عبر style
    return { raw: [], expr: classAttrValue };
  }
  return { raw: [], expr: null };
}

function rebuildClassAttr(j, classAttr, keptClasses, extraExpr) {
  // keptClasses: array of strings that remain after stripping mapped classes
  // extraExpr: JSXExpressionContainer we keep (cn/clsx/etc)
  if (extraExpr) {
    if (keptClasses.length === 0) {
      classAttr.value = extraExpr; // فقط التعبير
      return;
    }
    // لف الاثنين بـ cn('kept', expr)
    classAttr.value = j.jsxExpressionContainer(
      j.callExpression(j.identifier('cn'), [
        j.literal(keptClasses.join(' ')),
        extraExpr.expression ?? extraExpr,
      ])
    );
    return;
  }
  // مجرد سترنغ
  classAttr.value = j.literal(keptClasses.join(' '));
}

function removeClassesBySet(classes, removeSet) {
  return classes.filter((c) => !removeSet.has(c));
}

// -------- Transformer --------
module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let changed = false;

  // امسح كل JSX elements
  root.find(j.JSXOpeningElement).forEach((p) => {
    const opening = p.node;
    const attrs = opening.attributes || [];
    const classAttr = attrs.find((a) => a.type === 'JSXAttribute' && a.name?.name === 'className');

    // اجمع الكلاسات (لو سترنغ بسيط)
    const { raw: rawClasses, expr: complexExpr } = classAttr
      ? parseClassesFromAttr(j, classAttr.value)
      : { raw: [], expr: null };

    // --- COLORS to style ---
    const colorRemovals = new Set();
    let needColors = false;

    for (const cls of rawClasses) {
      if (TEXT_COLOR_MAP[cls]) {
        const styleObj = getOrCreateStyleObject(j, opening);
        upsertStyleProp(j, styleObj, 'color', TEXT_COLOR_MAP[cls]);
        colorRemovals.add(cls);
        needColors = true;
      }
      if (BG_COLOR_MAP[cls]) {
        const styleObj = getOrCreateStyleObject(j, opening);
        upsertStyleProp(j, styleObj, 'backgroundColor', BG_COLOR_MAP[cls]);
        colorRemovals.add(cls);
        needColors = true;
      }
      if (BORDER_COLOR_MAP[cls]) {
        const styleObj = getOrCreateStyleObject(j, opening);
        upsertStyleProp(j, styleObj, 'borderColor', BORDER_COLOR_MAP[cls]);
        // لو ما فيه border أصلاً نضيف `border: '1px solid'`؟ نتركه للمكوّن (أكثر أمانًا)
        colorRemovals.add(cls);
        needColors = true;
      }
    }

    // --- TYPOGRAPHY classes إلى tokens.typography (className) ---
    // نبحث عن التركيبات الأكثر تحديدًا أولاً
    let appliedTypography = null;
    const allTypoKeys = Object.keys(TYPOGRAPHY_CLASS_MAP).sort((a, b) => b.length - a.length);
    for (const key of allTypoKeys) {
      const parts = key.split(/\s+/);
      if (parts.every((c) => rawClasses.includes(c))) {
        appliedTypography = TYPOGRAPHY_CLASS_MAP[key];
        // احذف جميع الكلاسات المشاركة
        parts.forEach((c) => colorRemovals.add(c));
        break;
      }
    }
    if (appliedTypography) {
      // أضف/ادمج className بـ typography.*
      const typoExpr = tokenAccessToMemberExpr(j, appliedTypography);
      if (!classAttr) {
        opening.attributes.push(
          j.jsxAttribute(
            j.jsxIdentifier('className'),
            j.jsxExpressionContainer(typoExpr)
          )
        );
      } else {
        // دمج typography مع الموجود: cn(typography..., kept..., expr?)
        const kept = removeClassesBySet(rawClasses, colorRemovals);
        if (complexExpr) {
          classAttr.value = j.jsxExpressionContainer(
            j.callExpression(j.identifier('cn'), [
              typoExpr,
              kept.length ? j.literal(kept.join(' ')) : null,
              complexExpr.expression ?? complexExpr,
            ].filter(Boolean))
          );
        } else {
          classAttr.value =
            kept.length === 0
              ? j.jsxExpressionContainer(typoExpr)
              : j.jsxExpressionContainer(
                  j.callExpression(j.identifier('cn'), [typoExpr, j.literal(kept.join(' '))])
                );
        }
      }
      changed = true;
    }

    // --- SPACING إلى style ---
    let spacingUsed = false;
    for (const [cls, conf] of Object.entries(SPACING_CLASS_TO_PROP)) {
      if (rawClasses.includes(cls)) {
        const styleObj = getOrCreateStyleObject(j, opening);
        upsertStyleProp(j, styleObj, conf.styleKey, conf.token);
        colorRemovals.add(cls);
        spacingUsed = true;
      }
    }

    // --- SHADOWS ---
    let shadowsUsed = false;
    for (const [cls, info] of Object.entries(SHADOW_CLASS_MAP)) {
      if (rawClasses.includes(cls)) {
        // نستخدم shadowClasses.card كـ className إضافي
        const shadowExpr = tokenAccessToMemberExpr(j, info.class);
        if (!classAttr) {
          opening.attributes.push(
            j.jsxAttribute(
              j.jsxIdentifier('className'),
              j.jsxExpressionContainer(shadowExpr)
            )
          );
        } else {
          // دمج ضمن cn(...)
          const kept = removeClassesBySet(rawClasses, colorRemovals);
          classAttr.value = j.jsxExpressionContainer(
            j.callExpression(j.identifier('cn'), [
              shadowExpr,
              kept.length ? j.literal(kept.join(' ')) : null,
              complexExpr ? (complexExpr.expression ?? complexExpr) : null,
            ].filter(Boolean))
          );
        }
        colorRemovals.add(cls);
        shadowsUsed = true;
      }
    }

    // --- إذا ما طبقنا تايبوجرافي أو شادو، نعيد بناء className بدون الكلاسات التي تحوّلت لستايل ---
    if (classAttr && (needColors || spacingUsed) && !appliedTypography && !shadowsUsed) {
      const kept = removeClassesBySet(rawClasses, colorRemovals);
      rebuildClassAttr(j, classAttr, kept, complexExpr);
      changed = true;
    }

    // لو ما كان فيه className أصلاً لكن ضفنا style → برضه تغيّر
    if (!classAttr && (needColors || spacingUsed)) {
      changed = true;
    }
  });

  if (changed) {
    // inject imports
    ensureImport(
      j,
      root,
      TOKEN_IMPORT_SRC,
      ['colors', 'typography', 'spacing', 'shadows', 'shadowClasses', 'componentRadius']
    );
    ensureImport(j, root, UTILS_IMPORT_SRC, ['cn']);
  }

  return changed ? root.toSource({ quote: 'single', trailingComma: true }) : null;
};
