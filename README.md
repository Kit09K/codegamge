# ⚔️ CodeCombat Local Edition

แพลตฟอร์มเว็บเรียนเขียนโปรแกรมผ่านเกมแนว RPG แบบ Local ที่ถอดแบบโครงสร้าง ดีไซน์ และหลักสูตรมาจาก [CodeCombat](https://codecombat.com/) ด้วยทักษะ **`reverse-engineer-anything`** และปรับแต่งความเร็วด้วย **`rea-analysis-optimization`**

## ✨ คุณสมบัติเด่น
- **5 โลกแคมเปญ (Campaign Worlds) & 20 ด่านที่เล่นได้จริง**:
  1. **Kithgard Dungeon** (8 ด่าน) — พื้นฐานคำสั่งเดิน, Arguments, Strings, Comments, Variables, `findNearestEnemy()`, `while True:` Loops และเขาวงกต
  2. **Backwoods Forest** (4 ด่าน) — ค้อนก่อสร้าง `buildXY("fire-trap")`, เงื่อนไข `if / else`, สกิล `cleave()`, การวัดระยะ `distanceTo()` และการสร้างฟังก์ชัน `def`
  3. **Sarven Desert** (3 ด่าน) — การคำนวณพิกัด `(x, y)`, การกรองไอเทมด้วย `findNearestItem()` และตรรกะผสม `if / elif / else`
  4. **Cloudrip Mountain** (3 ด่าน) — การจัดการ Array/List (`findEnemies()`, `findItems()`), ลูป `for ... in` และศึกบอส **The Skeleton King**
  5. **Kelvintaph Glacier** (2 ด่าน) — ปริศนาหลายขั้นตอนและการสังเคราะห์อัลกอริทึมระดับ Grandmaster
- **รองรับ 2 ภาษาโปรแกรม**: สลับเขียนได้ทั้ง **🐍 Python** และ **📜 JavaScript**
- **Backend Simulation Engine ความเร็วสูง**: ประมวลผลการรบและตรวจคำตอบบน Backend เฉลี่ยเพียง **~0.5 - 2 ms ต่อด่าน** พร้อมส่ง Timeline กลับมาแสดงผลที่ 60 FPS บน HTML5 Canvas
- **🦅 Baby Griffin AI Mentor**: วิเคราะห์โค้ดและบรรทัดที่ผิดพลาด พร้อมคำใบ้ (Hints) และปุ่ม **Apply Solution =>**
- **🛡️ ระบบ Login, ร้านค้าฮีโร่/อุปกรณ์, ห้องเรียน (Classroom) และ Leaderboard**: จัดเก็บข้อมูลถาวรลงฐานข้อมูล **SQLite (`data/codecombat.db`)** โดยไม่ต้องติดตั้งแพ็กเกจภายนอก (`0 node_modules`)

## 🚀 การเริ่มต้นใช้งาน

```bash
# รันเซิร์ฟเวอร์ (พอร์ต 3000)
npm start

# รันชุดทดสอบความถูกต้องและวัดความเร็วทั้ง 20 ด่าน (Python + JS)
npm test
```

เปิดเบราว์เซอร์ไปที่: **http://localhost:3000**

### บัญชีทดสอบ (1-Click Demo Login บนหน้าเว็บ)
- **นักเรียน (Student)**: Username `hero` / Password `1234`
- **อาจารย์ (Teacher)**: Username `teacher` / Password `1234` (รหัสห้องเรียน: `COCO-101`)
