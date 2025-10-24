# Quick Testing Guide - ML Model Fixes

## 🚀 Quick Start

### 1. Test the ML Model (Backend Only)
```bash
cd backend
python test_predictions.py
```

**Expected Output:**
```
TESTING ML MODEL PREDICTIONS - SCORE NORMALIZATION
[TEST] Sample input (N=90, P=42, K=43, temp=21, humidity=82, ph=6.5, rainfall=202)

[RESULTS]
1. Rice: 87.5% [VALID]
2. Wheat: 75.2% [VALID]
3. Maize: 68.9% [VALID]
...

SUCCESS: All scores are between 0-100%
```

---

### 2. Test via API (Full Stack)

**Start Backend:**
```bash
cd backend
python main.py
```

**Test with curl (in another terminal):**
```bash
curl -X POST http://localhost:8000/api/recommend-manual ^
  -H "Content-Type: application/json" ^
  -d "{\"N\": 90, \"P\": 42, \"K\": 43, \"temperature\": 21, \"humidity\": 82, \"ph\": 6.5, \"rainfall\": 202}"
```

**Expected Response:**
```json
{
  "recommendations": [
    {
      "crop_name": "Rice",
      "suitability_score": 87.54,
      "probability": 0.8754,
      "reason": "Highly suitable based on ML model prediction..."
    }
  ]
}
```

✅ **All `suitability_score` values should be between 0 and 100**

---

### 3. Test via Frontend

**Start Frontend:**
```bash
cd frontend
npm run dev
```

**Manual Test Steps:**
1. Open browser to `http://localhost:5173`
2. Click "Manual Input" tab
3. Enter test values:
   - N: 90
   - P: 42
   - K: 43
   - Temperature: 21
   - Humidity: 82
   - pH: 6.5
   - Rainfall: 202
4. Click "Get Recommendations"
5. **Verify:** All suitability scores show as percentages between 0-100%

---

## 🔍 What to Look For

### ✅ SUCCESS Indicators
- All scores between 0% and 100%
- Scores display with 1-2 decimal places (e.g., 87.5%)
- Progress bars fill correctly
- No console errors

### ❌ FAILURE Indicators
- Scores above 100% (e.g., 506%)
- Negative scores
- NaN or undefined values
- Console errors about invalid scores

---

## 📊 Sample Test Cases

### Test Case 1: Normal Input (Rice-friendly)
```json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 21,
  "humidity": 82,
  "ph": 6.5,
  "rainfall": 202
}
```
**Expected:** Rice ~85%, Wheat ~75%

### Test Case 2: High Nutrients
```json
{
  "N": 140,
  "P": 145,
  "K": 205,
  "temperature": 35,
  "humidity": 90,
  "ph": 7.5,
  "rainfall": 250
}
```
**Expected:** All scores still ≤ 100%

### Test Case 3: Low Nutrients
```json
{
  "N": 20,
  "P": 15,
  "K": 10,
  "temperature": 15,
  "humidity": 40,
  "ph": 5.5,
  "rainfall": 50
}
```
**Expected:** Lower scores, but still ≥ 0%

---

## 🐛 Debugging

### Check Server Logs
When you run the backend, you'll see detailed logs:

```
============================================================
ML MODEL PREDICTION REQUEST
============================================================
Input Parameters:
  N=90, P=42, K=43
  Temperature=21°C, Humidity=82%
  pH=6.5, Rainfall=202mm

Raw probabilities from model:
  Min: 0.001234
  Max: 0.875432
  Sum: 1.000000

Top 5 predictions (before normalization):
  1. Rice: probability=0.875432, score=87.54%

Final recommendations (after normalization):
  1. Rice: suitability=87.54%, confidence=0.8754
============================================================
```

### If Scores Are Still Wrong

1. **Check model file exists:**
   ```bash
   ls backend/models/crop_model.cbm
   ```

2. **Retrain model if needed:**
   ```bash
   cd backend
   python train_model.py
   ```

3. **Check Python dependencies:**
   ```bash
   pip install numpy pandas catboost scikit-learn
   ```

4. **Verify code changes were applied:**
   - Check `backend/ml_service.py` line 192 has `np.clip()`
   - Check `frontend/src/services/api.ts` has score validation

---

## 📝 Summary

**What Was Fixed:**
- ✅ Backend: Added `np.clip()` to clamp scores 0-100%
- ✅ Backend: Added input validation
- ✅ Backend: Added comprehensive logging
- ✅ Frontend: Added score validation in API layer
- ✅ Created test script for verification

**Files Modified:**
- `backend/ml_service.py`
- `frontend/src/services/api.ts`

**Files Created:**
- `backend/test_predictions.py`
- `backend/FIXES_SUMMARY.md`
- `TESTING_GUIDE.md` (this file)

---

## 🎯 Quick Verification Checklist

- [ ] Run `python backend/test_predictions.py` - all tests pass
- [ ] Start backend, test API with curl - scores 0-100%
- [ ] Start frontend, test manual input - scores display correctly
- [ ] Check server logs - see detailed prediction info
- [ ] No console errors in browser
- [ ] Progress bars display correctly

**If all checkboxes are ✅, the fix is working!**
