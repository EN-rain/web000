import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const outputDir = join(process.cwd(), "public", "silver-palace");

const urls = [
  "https://silverpalace.elementagames.com/_nuxt/en-us.J3q3qYlr.svg",
  "https://silverpalace.elementagames.com/_nuxt/home_para4.DbjoLLQN.png",
  "https://silverpalace.elementagames.com/_nuxt/home_para3.PwSYvyyh.png",
  "https://silverpalace.elementagames.com/_nuxt/home_para2.CSWHckPL.png",
  "https://silverpalace.elementagames.com/_nuxt/home_para1.DFCFWv0Q.png",
  "https://silverpalace.elementagames.com/_nuxt/home_bg.nynm9_TJ.jpg",
  "https://silverpalace.elementagames.com/_nuxt/home_bg3.wAGjrSHo.jpg",
  "https://silverpalace.elementagames.com/_nuxt/home_mask.CVVcUCr3.png",
  "https://silverpalace.elementagames.com/_nuxt/check_en_us.B0Ccx4QE.png",
  "https://silverpalace.elementagames.com/_nuxt/en-us_frame.Dg1QKPHR.png",
  "https://silverpalace.elementagames.com/_nuxt/btn_reserve_bg.O9CjF6MW.png",
  "https://silverpalace.elementagames.com/_nuxt/world_bg.D5LtmynE.jpg",
  "https://silverpalace.elementagames.com/_nuxt/world_baiyin_ele.CKmsAp8R.png",
  "https://silverpalace.elementagames.com/_nuxt/scene_bg.BkjFGT2w.jpg",
  "https://silverpalace.elementagames.com/_nuxt/world_paper_1.Bp11zWZ_.jpg",
  "https://silverpalace.elementagames.com/_nuxt/world_paper1_txt_en.Ch_KHRmw.png",
  "https://silverpalace.elementagames.com/_nuxt/world_paper_2_bg.D-OSo_EA.png",
  "https://silverpalace.elementagames.com/_nuxt/world_paper2_txt_en.BvJ9s0u-.png",
  "https://silverpalace.elementagames.com/_nuxt/world_paper_3_bg.YCKr8oUu.png",
  "https://silverpalace.elementagames.com/_nuxt/world_paper3_txt_en.bQX_PPtj.png",
  "https://silverpalace.elementagames.com/_nuxt/world_paper_4_bg.0HSQ_FQ9.png",
  "https://silverpalace.elementagames.com/_nuxt/world_paper4_txt_en.DKQyjoiP.png",
  "https://silverpalace.elementagames.com/_nuxt/world_paper_1.DFyXVgb-.png",
  "https://silverpalace.elementagames.com/_nuxt/world_paper_2.K4Yk8VU_.png",
  "https://silverpalace.elementagames.com/_nuxt/world_paper_3.6YiZhceW.png",
  "https://silverpalace.elementagames.com/_nuxt/world_paper_4.BF6yeVwn.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_7.bDn4m13k.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_7_hover.DNiEylnG.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_5.CNf6ljCc.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_5_hover.QAC7iZ-O.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_6.Bcv9TQGi.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_6_hover.B54sAfP4.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_10.CpaPquFL.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_10_hover.BOinG3_V.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_14.C9uAfl6R.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_14_hover.zf6q6qyX.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_15.BFS5JvU6.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_15_hover.DmGA89rN.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_16.-jbnwod0.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_16_hover.C5yyQ7T3.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_17.BEGxWo47.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_17_hover.B-zv4cw2.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_1.B-s_rvt0.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_1_hover.uqJjob_e.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_2.D2mt0pfH.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_2_hover.BZbdmepY.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_3.DVoFvdm3.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_3_hover.CivfJ8qG.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_4.DbjEKUDU.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_4_hover.DnPQtC9t.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_8.CCIUd8gh.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_8_hover.ivNEPki2.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_9.amO_NhWj.png",
  "https://silverpalace.elementagames.com/_nuxt/world_img_9_hover.DqhdcC3N.png",
];

await mkdir(outputDir, { recursive: true });

let index = 0;
const workers = Array.from({ length: 4 }, async () => {
  while (index < urls.length) {
    const url = urls[index++];
    const filename = basename(new URL(url).pathname);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}: ${url}`);
    }
    await writeFile(join(outputDir, filename), Buffer.from(await response.arrayBuffer()));
    process.stdout.write(`downloaded ${filename}\n`);
  }
});

await Promise.all(workers);
console.log(`Saved ${urls.length} assets to ${outputDir}`);
