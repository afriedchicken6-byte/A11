# A1 Best Fried Chicken — منيو إلكتروني

منيو إلكتروني لمطعم A1 (فرايد تشيكن وبرجر): طلب مباشر عبر واتساب مع ترقيم يومي تسلسلي للأوردرات ولوحة إدارة.

- React 19 + Vite + Tailwind CSS 4
- Firebase (Firestore + Google sign-in للوحة الإدارة)
- تصميم دارك فخم مع تفاعلات (ripple، طيران الصنف للسلة، بطاقات بتأثير ضوئي، وزر الإرسال على شكل دجاجة)

## التشغيل محليًا

```bash
npm install     # أو: bun install
npm run dev     # http://localhost:3000
```

## البناء

```bash
npm run build   # الناتج في dist/
```

## النشر على GitHub Pages

النشر تلقائي عند كل push على `main` عبر `.github/workflows/deploy.yml`.

1. من إعدادات المستودع: **Settings → Pages → Source: GitHub Actions**.
2. الرابط: `https://<username>.github.io/<repo>/`
3. لتعمل لوحة الإدارة (تسجيل الدخول بجوجل) على الرابط، أضف نطاق GitHub Pages
   (`<username>.github.io`) في Firebase Console ← Authentication ← Settings ← Authorized domains.

## قواعد Firestore

ملف `firestore.rules` يوثّق القواعد المعتمدة. تعديله في المستودع لا ينشره تلقائيًا؛
انشره من Firebase Console أو بالأمر `firebase deploy --only firestore:rules`.
