# ⚔️ CodeCombat Local Edition (Codegamge)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Kit09K/codegamge)

แพลตฟอร์มเว็บเรียนเขียนโปรแกรมผ่านเกมแนว RPG แบบ Local ที่ถอดแบบโครงสร้าง ดีไซน์ และหลักสูตรมาจาก [CodeCombat](https://codecombat.com/) ด้วยทักษะ **`reverse-engineer-anything`** และปรับแต่งความเร็วด้วย **`rea-analysis-optimization`**

## ✨ คุณสมบัติเด่น
- **5 โลกแคมเปญ (Campaign Worlds) & 25 ด่านที่เล่นได้จริง**:
  1. **Kithgard Dungeon** (9 ด่าน) — พื้นฐานคำสั่งเดิน, Arguments, Strings, Comments, Variables, `findNearestEnemy()`, `while True:` Loops, รหัสผ่านเปิดประตู และห้องนิรภัย `kithgard-vault`
  2. **Backwoods Forest** (5 ด่าน) — ค้อนก่อสร้าง `buildXY("fire-trap")`, เงื่อนไข `if / else`, สกิล `cleave()`, การวัดระยะ `distanceTo()`, ฟังก์ชัน `def` และการรับมือฝูงโอเกอร์ `backwoods-ambush`
  3. **Sarven Desert** (4 ด่าน) — การคำนวณพิกัด `(x, y)`, การกรองไอเทมด้วย `findNearestItem()`, ตรรกะผสม `if / elif / else` และการลาดตระเวนใน `mirage-canyon`
  4. **Cloudrip Mountain** (4 ด่าน) — การจัดการ Array/List (`findEnemies()`, `findItems()`), ลูป `for ... in`, การสร้างฟังก์ชันกำจัดศัตรู `summit-defender` และศึกบอส **The Skeleton King**
  5. **Kelvintaph Glacier** (3 ด่าน) — ปริศนาหลายขั้นตอน, การสังเคราะห์อัลกอริทึมระดับ Grandmaster และการปิดล้อมป้อมปราการ `glacier-citadel`
- **รองรับ 2 ภาษาโปรแกรม**: สลับเขียนได้ทั้ง **🐍 Python** และ **📜 JavaScript**
- **Backend Simulation Engine ความเร็วสูง**: ประมวลผลการรบและตรวจคำตอบบน Backend เฉลี่ยเพียง **~0.5 - 1 ms ต่อด่าน** พร้อมส่ง Timeline กลับมาแสดงผลที่ 60 FPS บน HTML5 Canvas
- **🦅 Baby Griffin AI Mentor**: วิเคราะห์โค้ดและบรรทัดที่ผิดพลาด พร้อมคำใบ้ (Hints) และปุ่ม **Apply Solution =>**
- **🛡️ ระบบ Login, ร้านค้าฮีโร่/อุปกรณ์, ห้องเรียน (Classroom) และ Leaderboard**: จัดเก็บข้อมูลถาวรลงฐานข้อมูล **SQLite (`data/codecombat.db`)** โดยไม่ต้องติดตั้งแพ็กเกจภายนอก (`0 node_modules`)

## 🚀 การเริ่มต้นใช้งาน

### 1. ใช้งานบน Local

```bash
# รันเซิร์ฟเวอร์ (พอร์ต 3000)
npm start

# รันชุดทดสอบความถูกต้องและวัดความเร็วทั้ง 25 ด่าน (50 runs: Python + JS)
npm test
```

เปิดเบราว์เซอร์ไปที่: **http://localhost:3000**

### 2. ติดตั้งขึ้น Render.com (1-Click Deployment)
คลิกปุ่มด้านล่างเพื่อ Deploy อัตโนมัติด้วย Render Blueprint:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Kit09K/codegamge)

- **Render Service Name**: `codegamge`
- **Live URL (หลัง Deploy)**: `https://codegamge.onrender.com`
- **Health Check Path**: `/api/health`

### บัญชีทดสอบ (1-Click Demo Login บนหน้าเว็บ)
- **นักเรียน (Student)**: Username `hero` / Password `1234`
- **อาจารย์ (Teacher)**: Username `teacher` / Password `1234` (รหัสห้องเรียน: `COCO-101`)
