const { LEVEL_BY_SLUG } = require('../data/curriculum');
const { simulateLevel } = require('./simulator');

function analyzeCodeAndAdvise({ levelSlug, code = '', language = 'python', question = '' }) {
  const level = LEVEL_BY_SLUG.get(levelSlug);
  if (!level) {
    return {
      ok: false,
      error: 'Level not found'
    };
  }

  const sim = simulateLevel({ levelSlug, code, language });
  const tips = [];

  if (sim.runtimeError) {
    tips.push(
      `⚠️ **พบข้อผิดพลาดที่บรรทัด ${sim.runtimeError.line}:** \`${sim.runtimeError.message}\`\n` +
      `ตรวจสอบการสะกดคำสั่ง เช่น \`hero.moveRight()\` หรือวงเล็บ/เครื่องหมายคำพูดให้ครบถ้วน`
    );
  } else if (sim.victory) {
    tips.push(
      `🎉 **ยอดเยี่ยมมาก!** โค้ดของคุณผ่านเป้าหมายครบทุกข้อแล้วใน ${sim.ticksTaken} เทิร์น (${sim.linesOfCode} บรรทัด)!`
    );
  } else {
    const failedGoals = sim.goals.filter(g => !g.passed);
    for (const fg of failedGoals) {
      if (fg.id === 'collect-gems') {
        tips.push(`💎 **ยังเก็บเพชรไม่ครบ:** ลองเช็กตำแหน่งเพชรบนแผนที่แล้วเพิ่มคำสั่งเดิน หรือใช้ \`hero.findNearestItem()\``);
      } else if (fg.id === 'defeat-all') {
        tips.push(`⚔️ **ยังมีศัตรูเหลืออยู่:** อย่าลืมโจมตียักษ์แต่ละตัวให้ครบ 2 ครั้ง หรือใช้ลูป \`while True:\` ร่วมกับ \`hero.findNearestEnemy()\``);
      } else if (fg.id === 'open-door') {
        tips.push(`🔓 **ประตูยังล็อกอยู่:** ใช้คำสั่ง \`hero.say("รหัสผ่าน")\` ตามที่ระบุไว้ใน Comment ของด่าน`);
      } else if (fg.id === 'survive') {
        tips.push(`🛡️ **ฮีโร่บาดเจ็บหรือชนหนาม:** ระวังอย่าเดินทับช่องที่มีหนามแหลม และใช้ \`hero.cleave()\` หรือ \`hero.shield()\` เมื่อสู้กับศัตรูหลายตัว`);
      } else if (fg.id === 'under-lines') {
        tips.push(`📏 **โค้ดยาวเกินกำหนด:** ใช้ลูป \`while True:\` เพื่อยุบคำสั่งที่ซ้ำกันให้สั้นลง!`);
      }
    }
  }

  const hintText = (level.hints || []).map((h, i) => `${i + 1}. ${h}`).join('\n');
  const recommendedSolution = level.solutionCode?.[language] || level.solutionCode?.python || '';

  return {
    ok: true,
    mentorName: 'Baby Griffin AI Mentor',
    levelName: level.name,
    concept: level.concept,
    diagnosis: tips.join('\n\n'),
    hints: level.hints || [],
    hintSummary: hintText,
    solutionCode: recommendedSolution,
    canApplySolution: true
  };
}

module.exports = {
  analyzeCodeAndAdvise
};
