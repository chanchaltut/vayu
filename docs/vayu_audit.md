# VAYU — Full Project Audit
### Submission Deadline: 8 July | Time Remaining: ~33 hours

---

## Overall Completion: ~32% of a working demo

---

## Evaluation Criteria vs Current State

| Criterion | Weight | Current State | Score |
|---|---|---|---|
| Problem-Solution Fit | 20% | Concept is solid, README explains it well | ~15/20 |
| AI/Technical Execution | 25% | Backend written but **nothing is wired end-to-end, no data flows** | ~3/25 |
| Deployability & Scalability | 25% | BigQuery schema designed, GCP set up partially | ~5/25 |
| Inclusivity & Accessibility | 15% | Hindi translation in alerts handler (not tested) | ~3/15 |
| Impact Potential | 10% | Strong concept | ~7/10 |
| Presentation & Clarity | 5% | README good, UI placeholder only | ~2/5 |
| **TOTAL** | **100%** | | **~35/100** |

---

## Per-Folder Honest Audit

### 🔧 Hardware (Parth) — 60% done
| Item | Status | Notes |
|---|---|---|
| MQ135 + TMP36 sensors wired | ✅ | Circuit diagram exists (`MQ135_&_TMP35_ckt.png`) |
| Arduino firmware reads sensors | ✅ | `air.ino` reads both sensors, displays on LCD |
| Sends data to cloud | ❌ | **Sends to ThingSpeak, NOT to VAYU's `/api/sensors`** |
| Firebase/GCP integration | ❌ | Placeholder `YOUR_API_KEY` in firmware |
| Real hardware (vs TinkerCAD) | ⚠️ | TinkerCAD simulation only |

**Gap**: Arduino pushes to ThingSpeak. It needs to POST to `https://your-domain/api/sensors` instead.

---

### 💻 Backend/Fusion (Chanchal) — 55% done
| Item | Status | Notes |
|---|---|---|
| Next.js app running | ✅ | `localhost:3000` works |
| All lib files (Firebase, BigQuery, Gemini) | ✅ | Written correctly |
| `POST /api/sensors` route | ✅ Written | ❌ BigQuery table doesn't exist yet |
| `GET /api/sensors` route | ✅ Written | ❌ Same |
| `GET /api/hotspots` route | ✅ Written | ❌ Same |
| `POST /api/photos` route | ✅ Written | ❌ Same + Firebase Storage not tested |
| `POST /api/alerts` + Hindi translation | ✅ Written | ❌ Twilio creds empty, not tested |
| `GET /api/alerts` route | ✅ Written | ❌ BigQuery table doesn't exist |
| Gemini fusion engine | ✅ Written (TS) | ❌ Never been run, broken import chain |
| Hotspot detector | ✅ Written (TS) | ❌ Never been run |
| BigQuery tables created in GCP | ❌ MISSING | **This blocks EVERYTHING** |
| GCP auth working | ❌ Unknown | Two projects in .env, untested |
| API tested end-to-end | ❌ | Not a single API call verified |

---

### 🎨 Frontend (Ankit + Parth UI/Figma) — 8% done
| Item | Status | Notes |
|---|---|---|
| Figma design (Parth) | ⏳ In progress | Not yet implemented |
| Landing page | ✅ Basic | Just text + 2 buttons |
| Google Maps page | ❌ | "Coming soon" placeholder |
| Hotspot pins on map | ❌ | Not started |
| Photo upload UI | ❌ | Not started |
| Dashboard with data | ❌ | "Coming soon" placeholder |
| SMS alert trigger button | ❌ | Not started |
| Real-time data display | ❌ | Not started |

---

### 🤖 ML Models (Sumit) — 0% done
| Item | Status | Notes |
|---|---|---|
| Smoke detection model | ❌ | Not started (Gemini Vision is a fallback) |
| 24h AQI forecast model | ❌ | Not started |
| Training data | ❌ | No data yet (no sensors running) |
| Model integration with backend | ❌ | Not started |

**Note**: Gemini Vision (already in backend) can **substitute** smoke detection for the demo.
Gemini's `predicted_aqi_24h` in fusion engine can **substitute** the forecast model for the demo.

---

## What MUST Work for Demo (Minimum Viable Demo)

For judges to say "end-to-end flow works", this pipeline must run:

```
Sensor/Photo → POST /api/sensors → BigQuery
                                      ↓
                              Gemini Fusion Engine
                                      ↓
                              BigQuery hotspots table
                                      ↓
                         GET /api/hotspots → Google Maps pins
                                      ↓
                              POST /api/alerts → SMS mock
```

---

## Priority Order (Next 33 Hours)

### 🔴 BLOCKING — Do these first (Chanchal)
1. **Create BigQuery tables** in GCP console (30 min)
2. **Test `POST /api/sensors`** via curl/Postman — verify data lands in BQ (30 min)
3. **Test `GET /api/hotspots`** — verify it reads back (15 min)
4. **Run fusion engine** with mock data — verify Gemini responds (30 min)
5. **Seed 5-10 fake sensor readings** so the map has something to show (15 min)

### 🟡 HIGH — Unblocks frontend (Chanchal + Ankit)
6. **Test `POST /api/photos`** with a real image (30 min)
7. **Mock alert trigger** (no Twilio needed, `mock_sent` status is fine) (15 min)

### 🟢 FRONTEND — Ankit's work (needs Chanchal's APIs first)
8. **Google Maps page with hotspot pins** from `/api/hotspots`
9. **Photo upload form** that hits `/api/photos`
10. **Dashboard** showing sensor count, hotspot count, alert log

### ⚪ NICE TO HAVE (if time permits)
11. Parth redirect Arduino → VAYU API instead of ThingSpeak
12. Sumit's forecast model (Gemini substitutes fine for demo)
13. Real Twilio SMS

---

## The Single Most Important Next Step

**→ Create the 3 BigQuery tables in GCP console right now.**

Nothing else matters until this is done.
