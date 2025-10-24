# 🚀 START & TEST - Translation System

## Quick Start Guide

### **Step 1: Start Backend** (Terminal 1)

```bash
cd backend
python main.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

✅ Backend running on: http://localhost:8000

---

### **Step 2: Start Frontend** (Terminal 2)

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

✅ Frontend running on: http://localhost:5173

---

### **Step 3: Quick Test** (2 minutes)

1. **Open browser:** http://localhost:5173

2. **Test Language Selector:**
   - Look for 🌐 icon in top-right navbar
   - Click it
   - ✅ Should see: English ✓, తెలుగు, हिन्दी

3. **Switch to Telugu:**
   - Click "తెలుగు"
   - ✅ Toast notification appears
   - ✅ Navbar changes to Telugu

4. **Test Homepage:**
   - ✅ Title: "AI తో తెలివిగా పండించండి"
   - ✅ Button: "ప్రారంభించండి"

5. **Test Dashboard:**
   - Click "డ్యాష్‌బోర్డ్" in navbar
   - ✅ Title: "మీ పద్ధతిని ఎంచుకోండి"
   - Click "ఆటో-డిటెక్ట్ ఉపయోగించండి"
   - Click "నా స్థానాన్ని గుర్తించండి"
   - Allow location
   - ✅ **Crop names appear in Telugu!** (వరి, గోధుమ, etc.)

6. **Test Language Switch:**
   - Click 🌐 → Select "हिन्दी"
   - ✅ **Crop names change to Hindi instantly!** (चावल, गेहूं, etc.)

---

## ✅ SUCCESS CRITERIA

If you see:
- ✅ Navbar in Telugu/Hindi
- ✅ Dashboard labels in Telugu/Hindi
- ✅ **Crop names in Telugu/Hindi** ← CRITICAL
- ✅ Language changes update crops instantly

**🎉 TRANSLATION SYSTEM IS WORKING!**

---

## 🐛 Troubleshooting

### Backend won't start:
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend won't start:
```bash
cd frontend
npm install
npm run dev
```

### Translations not working:
1. Check browser console (F12)
2. Check Network tab for `/api/translate` requests
3. Verify both frontend and backend are running

---

## 📊 Quick Visual Test

**Before (English):**
```
Home | Dashboard | Community
Detect My Location
Rice, Wheat, Cotton
```

**After (Telugu):**
```
హోమ్ | డ్యాష్‌బోర్డ్ | కమ్యూనిటీ
నా స్థానాన్ని గుర్తించండి
వరి, గోధుమ, పత్తి
```

**After (Hindi):**
```
होम | डैशबोर्ड | समुदाय
मेरा स्थान पता करें
चावल, गेहूं, कपास
```

---

**Ready to test! Follow the steps above.** 🚀
