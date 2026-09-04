import { desktopCapturer, ipcMain, BrowserWindow, nativeImage, app, session } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Database from "better-sqlite3";
import { readFile, writeFile } from "fs/promises";
import { createWorker, PSM } from "tesseract.js";
var weapons = /* @__PURE__ */ ((weapons2) => {
  weapons2["B"] = "bow";
  weapons2["CB"] = "charge_blade";
  weapons2["DB"] = "dual_blades";
  weapons2["GL"] = "gunlance";
  weapons2["GS"] = "great_sword";
  weapons2["H"] = "hammer";
  weapons2["HBG"] = "heavy_bowgun";
  weapons2["HH"] = "hunting_horn";
  weapons2["IG"] = "insect_glaive";
  weapons2["L"] = "lance";
  weapons2["LBG"] = "light_bowgun";
  weapons2["LS"] = "long_sword";
  weapons2["SA"] = "switch_axe";
  weapons2["SnS"] = "sword_and_shield";
  return weapons2;
})(weapons || {});
var elements = /* @__PURE__ */ ((elements2) => {
  elements2["fire"] = "fire";
  elements2["water"] = "water";
  elements2["thunder"] = "thunder";
  elements2["ice"] = "ice";
  elements2["dragon"] = "dragon";
  elements2["paralysis"] = "paralysis";
  elements2["poison"] = "poison";
  elements2["sleep"] = "sleep";
  elements2["blast"] = "blast";
  return elements2;
})(elements || {});
var roll_type = /* @__PURE__ */ ((roll_type2) => {
  roll_type2["SKILLS"] = "skills";
  roll_type2["BONUSES"] = "bonuses";
  return roll_type2;
})(roll_type || {});
var set_bonus_skill = /* @__PURE__ */ ((set_bonus_skill2) => {
  set_bonus_skill2["dm"] = "Doshaguma's Might";
  set_bonus_skill2["xwv"] = "Xu Wu's Vigor";
  set_bonus_skill2["faw"] = "Fulgur Anjanath's Will";
  set_bonus_skill2["gp"] = "Gravios's Protection";
  set_bonus_skill2["rf"] = "Rathalos's Flare";
  set_bonus_skill2["bs"] = "Blangonga's Spirit";
  set_bonus_skill2["eop"] = "Ebony Odogaron's Power";
  set_bonus_skill2["rdv"] = "Rey Dau's Voltage";
  set_bonus_skill2["udc"] = "Uth Duna's Cover";
  set_bonus_skill2["num"] = "Nu Udra's Mutiny";
  set_bonus_skill2["jdr"] = "Jin Dahaad's Revolt";
  set_bonus_skill2["gav"] = "Guardian Arkveld's Vitality";
  set_bonus_skill2["ah"] = "Arkveld's Hunger";
  set_bonus_skill2["zsp"] = "Zoh Shia's Pulse";
  set_bonus_skill2["gmt"] = "Gore Magala's Tyranny";
  set_bonus_skill2["mp"] = "Mizutsune's Prowess";
  set_bonus_skill2["lf"] = "Leviathan's Fury";
  set_bonus_skill2["st"] = "Seregios's Tenacity";
  set_bonus_skill2["or"] = "Omega Resonance";
  set_bonus_skill2["sodk"] = "Soul of the Dark Knight";
  set_bonus_skill2["gmp"] = "Gogmapocalypse";
  return set_bonus_skill2;
})(set_bonus_skill || {});
var group_bonus_skill = /* @__PURE__ */ ((group_bonus_skill2) => {
  group_bonus_skill2["na"] = "Neopteron Alert";
  group_bonus_skill2["nc"] = "Neopteron Camouflage";
  group_bonus_skill2["sp"] = "Scaling Prowess";
  group_bonus_skill2["sl"] = "Scale Layering";
  group_bonus_skill2["fl"] = "Flexible Leathercraft";
  group_bonus_skill2["bl"] = "Buttery Leathercraft";
  group_bonus_skill2["fp"] = "Fortifying Pelt";
  group_bonus_skill2["ap"] = "Alluring Pelt";
  group_bonus_skill2["lfa"] = "Lord's Favor";
  group_bonus_skill2["lfu"] = "Lord's Fury";
  group_bonus_skill2["gpu"] = "Guardian's Pulse";
  group_bonus_skill2["gpr"] = "Guardian's Protection";
  group_bonus_skill2["iw"] = "Imparted Wisdom";
  group_bonus_skill2["ls"] = "Lord's Soul";
  return group_bonus_skill2;
})(group_bonus_skill || {});
var roll_type_other;
((roll_type_other2) => {
  roll_type_other2.compare_bonus_rolls = (br1, br2) => {
    let matchedIndices = /* @__PURE__ */ new Set();
    for (let bt of br1.roll) {
      const i = br2.reinforcements.findIndex((bonus, i2) => {
        return !matchedIndices.has(i2) && bonus == bt.bonus;
      });
      if (i == -1) {
        return false;
      } else {
        matchedIndices.add(i);
      }
    }
    return true;
  };
  roll_type_other2.compare_level_rolls = (kbr1, kbr2) => {
    let matchedIndices = /* @__PURE__ */ new Set();
    for (let rl of kbr1) {
      const i = kbr2.findIndex((bonus, i2) => {
        return !matchedIndices.has(i2) && bonus == rl;
      });
      if (i == -1) {
        return false;
      } else {
        matchedIndices.add(i);
      }
    }
    return true;
  };
  roll_type_other2.is_desired_skill_roll = (w, e, sr, preferences) => {
    for (let psr of preferences) {
      if ((!psr.weapon || psr.weapon === w) && (!psr.element || psr.element === e) && sr.set_bonus === psr.set_bonus && sr.group_bonus === psr.group_bonus) {
        return true;
      }
    }
    return false;
  };
  roll_type_other2.is_desired_amend_roll = (w, e, br, preferences) => {
    for (let pbr of preferences) {
      if ((!pbr.weapon || pbr.weapon === w) && (!pbr.element || pbr.element === e) && (0, roll_type_other2.compare_bonus_rolls)(br, pbr)) {
        return true;
      }
    }
    return false;
  };
  roll_type_other2.is_desired_keep_roll = (kbr, preference) => {
    if ((0, roll_type_other2.compare_level_rolls)(kbr.roll, preference)) {
      return true;
    }
    return false;
  };
})(roll_type_other || (roll_type_other = {}));
let string_set_bonus_enum = "";
let string_group_bonus_enum = "";
let weapons_enum = "";
let elements_enum = "";
const string_set_bonuses = Object.values(set_bonus_skill).map((sbs) => sbs.indexOf("'") != -1 ? `${sbs.slice(0, sbs.indexOf("'"))}''${sbs.slice(sbs.indexOf("'") + 1, sbs.length)}` : sbs);
for (let i = 0; i < string_set_bonuses.length; i++) {
  if (i != 0) {
    string_set_bonus_enum += ", ";
  }
  string_set_bonus_enum += `'${string_set_bonuses[i]}'`;
}
const string_group_bonuses = Object.values(group_bonus_skill).map((gbs) => gbs.indexOf("'") != -1 ? `${gbs.slice(0, gbs.indexOf("'"))}''${gbs.slice(gbs.indexOf("'") + 1, gbs.length)}` : gbs);
for (let i = 0; i < string_group_bonuses.length; i++) {
  if (i != 0) {
    string_group_bonus_enum += ", ";
  }
  string_group_bonus_enum += `'${string_group_bonuses[i]}'`;
}
const string_weapons = Object.values(weapons);
for (let i = 0; i < string_weapons.length; i++) {
  if (i != 0) {
    weapons_enum += ", ";
  }
  weapons_enum += `'${string_weapons[i]}'`;
}
const string_elements = Object.values(elements);
for (let i = 0; i < string_elements.length; i++) {
  if (i != 0) {
    elements_enum += ", ";
  }
  elements_enum += `'${string_elements[i]}'`;
}
const dbInitString = `
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS weapon_profile (
        profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
        weapon TEXT CHECK( weapon IN (${weapons_enum}) ),
        element TEXT CHECK( element IN (${elements_enum}) )
    );

    CREATE TABLE IF NOT EXISTS skill_rolls (
        roll_num INTEGER,
        profile_id INTEGER REFERENCES weapon_profile(profile_id),
        set_bonus TEXT CHECK( set_bonus IN (${string_set_bonus_enum}, '') ),
        group_bonus TEXT CHECK( group_bonus IN (${string_group_bonus_enum}, '') ),
        PRIMARY KEY (roll_num, profile_id)
    );

    CREATE TABLE IF NOT EXISTS amend_bonus_rolls (
        roll_num INTEGER,
        profile_id INTEGER REFERENCES weapon_profile(profile_id),
        reinforcements TEXT,
        reinforcement_levels TEXT,
        reinforcements_canonical TEXT,
        PRIMARY KEY (roll_num, profile_id)
    );

    CREATE TABLE IF NOT EXISTS keep_bonus_profile (
        keep_id TEXT PRIMARY KEY,
        name TEXT,
        profile_id INTEGER REFERENCES weapon_profile(profile_id),
        curr_reinforcements TEXT,
        curr_reinforcement_levels TEXT,
        canonical_target_reinforcement_levels TEXT
    );
    
    CREATE TABLE IF NOT EXISTS keep_bonus_rolls (
        keep_id TEXT PRIMARY KEY REFERENCES keep_bonus_weapon(keep_id),
        roll_num INTEGER,
        reinforcement_levels TEXT,
        reinforcement_levels_canonical TEXT
    );

    CREATE TABLE IF NOT EXISTS skill_preferences (
        weapon TEXT CHECK( weapon IN (${weapons_enum}) ),
        element TEXT CHECK( element IN (${elements_enum}) ),
        set_bonus TEXT CHECK( set_bonus IN (${string_set_bonus_enum}) ),
        group_bonus TEXT CHECK( group_bonus IN (${string_group_bonus_enum}) ),
        PRIMARY KEY (weapon, element, set_bonus, group_bonus)
    );

    CREATE TABLE IF NOT EXISTS bonus_preferences (
        weapon TEXT CHECK( weapon IN (${weapons_enum}) ),
        element TEXT CHECK( element IN (${elements_enum}) ),
        reinforcements TEXT,
        PRIMARY KEY (weapon, element, reinforcements)
    );

`;
var gogma_database;
((gogma_database2) => {
  function get_profile_id(database, weapon, element, create) {
    const profile_id = database.prepare(`SELECT profile_id FROM weapon_profile WHERE weapon = ? AND element = ?`).get(weapon, element);
    if (profile_id !== void 0) {
      return profile_id["profile_id"];
    } else if (create) {
      database.exec(`INSERT INTO weapon_profile(weapon, element) VALUES ('${weapon}', '${element}')`);
      const profile_id2 = database.prepare(`SELECT last_insert_rowid()`).get();
      return profile_id2["last_insert_rowid()"];
    } else {
      return 0;
    }
  }
  gogma_database2.get_profile_id = get_profile_id;
  function get_weapon_profiles(database, weapon, element) {
    if (weapon !== null && element !== null) {
      const profiles = database.prepare(`SELECT * FROM weapon_profile WHERE weapon = ? AND element = ?`).all(weapon, element);
      return profiles;
    } else if (weapon !== null) {
      const all_elements_of_weapon = database.prepare(`SELECT * FROM weapon_profile WHERE weapon = ?`).all(weapon);
      return all_elements_of_weapon;
    } else if (element !== null) {
      const all_weapons_of_element = database.prepare(`SELECT * FROM weapon_profile WHERE element = ?`).all(element);
      return all_weapons_of_element;
    } else {
      return database.prepare(`SELECT * FROM weapon_profile`).all();
    }
  }
  gogma_database2.get_weapon_profiles = get_weapon_profiles;
  gogma_database2.skill_stats_query = `
    SELECT s.weapon, s.element, COUNT(*) - 1 as num_rolls,
    (
        SELECT json_group_array(
        json_object(
            'roll_num', sr.roll_num,
            'set_bonus', sr.set_bonus,
            'group_bonus', sr.group_bonus
        )
        )
        FROM (skill_rolls NATURAL JOIN weapon_profile) sr
        WHERE sr.roll_num != 0
        AND sr.weapon = s.weapon 
        AND sr.element = s.element
        AND EXISTS (
            SELECT 1 
            FROM skill_preferences p 
            WHERE (p.weapon IS NULL OR p.weapon = sr.weapon)
            AND (p.element IS NULL OR p.element = sr.element)
            AND p.set_bonus = sr.set_bonus 
            AND p.group_bonus = sr.group_bonus
        )
    ) AS god_rolls
    FROM (skill_rolls NATURAL JOIN weapon_profile) s
    GROUP BY s.weapon, s.element
    `;
  gogma_database2.amend_stats_query = `
    SELECT ab.weapon, ab.element, COUNT(*) - 1 as num_rolls,
    (
        SELECT json_group_array(
        json_object(
            'roll_num', abr.roll_num,
            'reinforcements', abr.reinforcements,
            'reinforcement_levels', abr.reinforcement_levels
        )
        )
        FROM (amend_bonus_rolls NATURAL JOIN weapon_profile) abr
        WHERE abr.roll_num != 0
        AND abr.weapon = ab.weapon 
        AND abr.element = ab.element
        AND EXISTS (
            SELECT 1 
            FROM bonus_preferences p 
            WHERE (p.weapon IS NULL OR p.weapon = abr.weapon)
            AND (p.element IS NULL OR p.element = abr.element)
            AND p.reinforcements = abr.reinforcements_canonical
        )
    ) AS god_rolls
    FROM (amend_bonus_rolls NATURAL JOIN weapon_profile) ab
    GROUP BY ab.weapon, ab.element
    `;
  gogma_database2.keep_stats_query = `
    SELECT kb.keep_id, kb.name, kb.weapon, kb.element, kb.curr_reinforcements, kb.curr_reinforcement_levels, kb.canonical_target_reinforcement_levels, COUNT(*) as num_rolls,
    (
        SELECT json_group_array(
        json_object(
            'roll_num', kbr.roll_num,
            'roll', kbr.reinforcement_levels
        )
        )
        FROM keep_bonus_rolls kbr
        WHERE kbr.keep_id = kb.keep_id AND kbr.roll_num != 0
        AND kbr.reinforcement_levels_canonical = kb.canonical_target_reinforcement_levels
    ) AS god_rolls
    FROM ((keep_bonus_profile NATURAL JOIN weapon_profile) LEFT JOIN keep_bonus_rolls) kb
    GROUP BY kb.keep_id, kb.name, kb.weapon, kb.element, kb.curr_reinforcements, kb.curr_reinforcement_levels, kb.canonical_target_reinforcement_levels
    `;
  gogma_database2.weapons_with_skill_rolls = `SELECT DISTINCT weapon FROM weapon_profile wp WHERE EXISTS (SELECT 1 FROM skill_rolls WHERE profile_id = wp.profile_id)`;
  gogma_database2.weapons_with_amend_rolls = `SELECT DISTINCT weapon FROM weapon_profile wp WHERE EXISTS (SELECT 1 FROM amend_bonus_rolls WHERE profile_id = wp.profile_id)`;
  function convert_db_reinforcements_to_app(db_reinforcements, db_reinforcement_levels) {
    const db_reinforcement_levels_arr = db_reinforcement_levels.split(" ");
    return db_reinforcements.split(" ").map(
      (gr_bonus, i) => {
        return {
          bonus: gr_bonus,
          level: db_reinforcement_levels_arr[i]
        };
      }
    );
  }
  gogma_database2.convert_db_reinforcements_to_app = convert_db_reinforcements_to_app;
  function convert_bonus_roll_to_db(roll) {
    let reinf = "";
    let levels = "";
    roll.roll.forEach((r, i) => {
      if (i !== 0) {
        reinf += " ";
        levels += " ";
      }
      reinf += r.bonus;
      levels += r.level;
    });
    return { reinf, levels };
  }
  gogma_database2.convert_bonus_roll_to_db = convert_bonus_roll_to_db;
  function convert_app_reinf_to_db(reinf) {
    let str = "";
    reinf.forEach((l, i) => {
      if (i !== 0) {
        str += " ";
      }
      str += l;
    });
    return str;
  }
  gogma_database2.convert_app_reinf_to_db = convert_app_reinf_to_db;
  function convert_app_reinf_levels_to_db(levels) {
    let str = "";
    levels.forEach((l, i) => {
      if (i !== 0) {
        str += " ";
      }
      str += l;
    });
    return str;
  }
  gogma_database2.convert_app_reinf_levels_to_db = convert_app_reinf_levels_to_db;
})(gogma_database || (gogma_database = {}));
const get_rolls_query = (rollType) => `
    SELECT roll_num, ${rollType === "skills" ? "set_bonus, group_bonus" : "reinforcements, reinforcement_levels, reinforcements_canonical"} 
    FROM ${rollType === "skills" ? "skill_rolls" : "amend_bonus_rolls"} NATURAL JOIN weapon_profile
    WHERE profile_id = ? AND roll_num != 0
    ORDER BY roll_num ASC
`;
const get_keep_rolls_query = () => `
    SELECT roll_num, curr_reinforcements AS reinforcements, reinforcement_levels, reinforcement_levels_canonical
    FROM keep_bonus_rolls NATURAL JOIN keep_bonus_profile
    WHERE keep_id = ? AND roll_num != 0
    ORDER BY roll_num ASC
`;
const bonus_db_to_app = (bonus_string) => {
  return bonus_string.split(" ");
};
const levels_db_to_app = (levels_string) => {
  return levels_string.split(" ");
};
function addSkillRollQuery(pid, roll) {
  return `
    INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (${roll.roll_num}, ${pid}, '${roll.set_bonus.replace("'", "''")}', '${roll.group_bonus.replace("'", "''")}')
`;
}
function updateSkillRollQuery(pid, roll) {
  return `
    UPDATE skill_rolls SET set_bonus = '${roll.set_bonus.replace("'", "''")}', group_bonus = '${roll.group_bonus.replace("'", "''")}' WHERE profile_id = '${pid}' AND roll_num = ${roll.roll_num}
`;
}
function deleteSkillRollQuery(pid, rollnum) {
  return `
    DELETE FROM skill_rolls WHERE profile_id = ${pid} AND roll_num = ${rollnum}
`;
}
function addAmendRollQuery(pid, rollnum, reinforcements, levels, reinf_canon) {
  return `
    INSERT INTO amend_bonus_rolls(roll_num, profile_id, reinforcements, reinforcement_levels, reinforcements_canonical) VALUES (${rollnum}, ${pid}, '${reinforcements}', '${levels}', '${reinf_canon}') 
`;
}
function updateAmendRollQuery(pid, rollnum, reinforcements, levels, reinf_canon) {
  return `
    UPDATE amend_bonus_rolls SET reinforcements = '${reinforcements}', reinforcement_levels = '${levels}', reinforcements_canonical = '${reinf_canon}' WHERE profile_id = ${pid} AND roll_num = ${rollnum}  
`;
}
function deleteAmendRollQuery(pid, rollnum) {
  return `
    DELETE FROM amend_bonus_rolls WHERE profile_id = ${pid} AND roll_num = ${rollnum}
`;
}
function sanitizeSkillName(skill) {
  return skill.indexOf("'") !== -1 ? `${skill.slice(0, skill.indexOf("'"))}''${skill.slice(skill.indexOf("'") + 1, skill.length)}` : skill;
}
const canonical_reinf_order = {
  "ATTACK": 1,
  "AFFINITY": 2,
  "ELEMENT": 3,
  "SHARPNESS/AMMO": 4
};
function canonicalize_reinforcements(roll) {
  const n = roll.roll.map((r) => r.bonus).sort((a, b) => canonical_reinf_order[a] < canonical_reinf_order[b] ? -1 : 1);
  return gogma_database.convert_app_reinf_to_db(n);
}
class AppDatabase {
  db;
  constructor(db) {
    this.db = db;
    this.constructDatabase();
  }
  constructDatabase() {
    this.db.exec(dbInitString);
    console.log("Database Initialized!");
  }
  initialize_stats() {
    const keep_bonus_stats = {};
    const keep_bonus_profiles = {};
    for (let result of this.db.prepare(gogma_database.keep_stats_query).all()) {
      keep_bonus_profiles[result.keep_id] = {
        name: result.name,
        weapon: result.weapon,
        element: result.element,
        curr_reinforcements: gogma_database.convert_db_reinforcements_to_app(result.curr_reinforcements, result.curr_reinforcement_levels),
        canonical_target_reinforcement_levels: result.canonical_target_reinforcement_levels.split(" ")
      };
      keep_bonus_stats[result.keep_id] = {
        num_rolls: result.num_rolls,
        god_rolls: result.god_rolls.map((gr) => {
          return { roll_num: gr.roll_num, roll: gr.roll.split(" ") };
        })
      };
    }
    return { ss: this.get_skill_stats(), bs: this.get_amend_stats(), kbs: keep_bonus_stats, kbp: keep_bonus_profiles };
  }
  initialize_preferences() {
    return {
      skill_preferences: this.db.prepare(`SELECT * FROM skill_preferences ORDER BY weapon ASC, element ASC NULLS FIRST`).all(),
      bonus_preferences: this.db.prepare(`SELECT * FROM bonus_preferences ORDER BY weapon ASC, element ASC NULLS FIRST`).all().map((bpq) => {
        return { ...bpq, reinforcements: bpq.reinforcements.split(" ") };
      })
    };
  }
  get_skill_stats() {
    const skill_stats = {};
    for (let result of this.db.prepare(gogma_database.skill_stats_query).all()) {
      if (skill_stats[result.weapon] === void 0) {
        skill_stats[result.weapon] = {};
      }
      skill_stats[result.weapon][result.element] = { num_rolls: result.num_rolls, god_rolls: JSON.parse(result.god_rolls) };
    }
    return skill_stats;
  }
  get_amend_stats() {
    const amend_bonus_stats = {};
    for (let result of this.db.prepare(gogma_database.amend_stats_query).all()) {
      if (amend_bonus_stats[result.weapon] === void 0) {
        amend_bonus_stats[result.weapon] = {};
      }
      amend_bonus_stats[result.weapon][result.element] = {
        num_rolls: result.num_rolls,
        god_rolls: JSON.parse(result.god_rolls).map((gr) => {
          return { roll_num: gr.roll_num, roll: gogma_database.convert_db_reinforcements_to_app(gr.reinforcements, gr.reinforcement_levels) };
        })
      };
    }
    return amend_bonus_stats;
  }
  add_weapon(weapon, element, rollType) {
    const profile_id = gogma_database.get_profile_id(this.db, weapon, element, true);
    const insert_query = rollType === roll_type.SKILLS ? `INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (0, ${profile_id}, '', '')` : `INSERT INTO amend_bonus_rolls(roll_num, profile_id, reinforcements, reinforcement_levels, reinforcements_canonical) VALUES (0, ${profile_id}, '', '', '')`;
    this.db.exec(insert_query);
  }
  remove_weapon(weapon, rollType) {
    this.db.exec(`
            DELETE FROM ${rollType === roll_type.SKILLS ? "skill_rolls" : "amend_bonus_rolls"} 
            WHERE profile_id IN (
                SELECT wp.profile_id
                FROM weapon_profile wp
                WHERE weapon = '${weapon}'
            )`);
  }
  remove_combo(weapon, element, rollType) {
    this.db.exec(`
                DELETE FROM ${rollType === roll_type.SKILLS ? "skill_rolls" : "amend_bonus_rolls"}
                WHERE profile_id IN (
                    SELECT wp.profile_id
                    FROM weapon_profile wp
                    WHERE weapon = '${weapon}' AND element = '${element}'
                )
            `);
  }
  get_rolls(weapon, element, rollType) {
    try {
      const weapon_profile = this.db.prepare(`SELECT profile_id FROM weapon_profile WHERE weapon = ? AND element = ?`).get(weapon, element);
      const wpid = weapon_profile.profile_id;
      const arr = this.db.prepare(get_rolls_query(rollType)).all(wpid);
      if (rollType === roll_type.BONUSES) {
        return {
          rolls: arr.map((item) => {
            const reinforcement_levels_formatted = levels_db_to_app(item.reinforcement_levels);
            return {
              roll_num: item.roll_num,
              roll: bonus_db_to_app(item.reinforcements).map((r, i) => {
                return { bonus: r, level: reinforcement_levels_formatted[i] };
              }),
              reinforcements_canonical: item.reinforcements_canonical
            };
          }),
          profile_id: wpid.toString()
        };
      }
      return { rolls: arr, profile_id: wpid.toString() };
    } catch (e) {
      console.log(e);
      return { rolls: [] };
    }
  }
  get_keep_rolls(keep_id) {
    const keep_profile = this.db.prepare(`SELECT * FROM keep_bonus_profile NATURAL JOIN weapon_profile WHERE keep_id = ?`).get(keep_id);
    const arr = this.db.prepare(get_keep_rolls_query()).all(keep_id);
    return {
      rolls: arr,
      curr_reinforcements: keep_profile.curr_reinforcements,
      curr_levels: keep_profile.curr_reinforcement_levels,
      target: keep_profile.canonical_target_reinforcement_levels
    };
  }
  add_skill_roll(pid, roll, roll_exists) {
    const queryString = roll_exists ? updateSkillRollQuery(pid, roll) : addSkillRollQuery(pid, roll);
    this.db.exec(queryString);
  }
  remove_skill_roll(pid, roll_num) {
    this.db.exec(deleteSkillRollQuery(pid, roll_num));
  }
  add_amend_roll(pid, roll, roll_exists) {
    const { reinf, levels } = gogma_database.convert_bonus_roll_to_db(roll);
    const canon_reinf = canonicalize_reinforcements(roll);
    const queryString = roll_exists ? updateAmendRollQuery(pid, roll.roll_num, reinf, levels, canon_reinf) : addAmendRollQuery(pid, roll.roll_num, reinf, levels, canon_reinf);
    this.db.exec(queryString);
  }
  remove_amend_roll(pid, roll_num) {
    this.db.exec(deleteAmendRollQuery(pid, roll_num));
  }
  add_preference(rt, pref) {
    if (rt === roll_type.SKILLS) {
      const spref = pref;
      this.db.exec(`INSERT INTO skill_preferences(weapon, element, set_bonus, group_bonus) VALUES (${spref.weapon ? `'${spref.weapon}'` : "NULL"}, ${spref.element ? `'${spref.element}'` : "NULL"}, '${sanitizeSkillName(spref.set_bonus)}', '${sanitizeSkillName(spref.group_bonus)}')`);
    } else {
      const bpref = pref;
      let textReinforcements = "";
      for (let i = 0; i < bpref.reinforcements.length; i++) {
        const reinf = bpref.reinforcements[i];
        if (i != 0) {
          textReinforcements += " ";
        }
        textReinforcements += reinf;
      }
      this.db.exec(`INSERT INTO bonus_preferences(weapon, element, reinforcements) VALUES (${bpref.weapon ? `'${bpref.weapon}'` : "NULL"}, ${bpref.element ? `'${bpref.element}'` : "NULL"}, '${textReinforcements}')`);
    }
    return rt === roll_type.SKILLS ? this.get_skill_stats() : this.get_amend_stats();
  }
  edit_preference(rt, orig, n) {
    const origw = !orig.weapon ? "IS NULL" : `= '${orig.weapon}'`;
    const orige = !orig.element ? "IS NULL" : `= '${orig.element}'`;
    const nw = !n.weapon ? "NULL" : `'${n.weapon}'`;
    const ne = !n.element ? "NULL" : `'${n.element}'`;
    if (rt === roll_type.SKILLS) {
      const sorig = orig;
      const sn = n;
      this.db.exec(`UPDATE skill_preferences SET weapon = ${nw}, element = ${ne}, set_bonus = '${sanitizeSkillName(sn.set_bonus)}', group_bonus = '${sanitizeSkillName(sn.group_bonus)}' WHERE weapon ${origw} AND element ${orige} AND set_bonus = '${sanitizeSkillName(sorig.set_bonus)}' AND group_bonus = '${sanitizeSkillName(sorig.group_bonus)}'`);
    } else {
      let textReinfOrig = "";
      let textReinfNew = "";
      for (let i = 0; i < 5; i++) {
        const reinfOrig = orig.reinforcements[i];
        const reinfNew = n.reinforcements[i];
        if (i !== 0) {
          textReinfOrig += " ";
          textReinfNew += " ";
        }
        textReinfOrig += reinfOrig;
        textReinfNew += reinfNew;
      }
      this.db.exec(`UPDATE bonus_preferences SET weapon = ${nw}, element = ${ne}, reinforcements = '${textReinfNew}' WHERE weapon ${origw} AND element ${orige} AND reinforcements = '${textReinfOrig}'`);
    }
    return rt === roll_type.SKILLS ? this.get_skill_stats() : this.get_amend_stats();
  }
  remove_preference(rt, pref) {
    const w = pref.weapon ? `= '${pref.weapon}'` : "IS NULL";
    const e = pref.element ? `= '${pref.element}'` : "IS NULL";
    if (rt === roll_type.SKILLS) {
      const spref = pref;
      this.db.exec(`DELETE FROM skill_preferences WHERE weapon ${w} AND element ${e} AND set_bonus = '${sanitizeSkillName(spref.set_bonus)}' AND group_bonus = '${sanitizeSkillName(spref.group_bonus)}'`);
    } else {
      const bpref = pref;
      let textreinf = "";
      for (let i = 0; i < 5; i++) {
        const reinf = bpref.reinforcements[i];
        if (i !== 0) {
          textreinf += " ";
        }
        textreinf += reinf;
      }
      this.db.exec(`DELETE FROM bonus_preferences WHERE weapon ${w} AND element ${e} AND reinforcements = '${textreinf}'`);
    }
    return rt === roll_type.SKILLS ? this.get_skill_stats() : this.get_amend_stats();
  }
}
async function get_mh_wilds_window_id() {
  const window_sources = await desktopCapturer.getSources({ types: ["window"] });
  const mh_wilds_window = window_sources.filter((ws) => ws.name.includes("Monster Hunter Wilds"))[0];
  if (mh_wilds_window === void 0) {
    return void 0;
  } else {
    return mh_wilds_window.id;
  }
}
const generate_default = (rollType, display_x, display_y, display_width, display_height, scale, detection_x, detection_y, detection_width, detection_height) => {
  const display_detection_settings = {};
  display_detection_settings[`${rollType}_display_x`] = display_x;
  display_detection_settings[`${rollType}_display_y`] = display_y;
  display_detection_settings[`${rollType}_display_width`] = display_width;
  display_detection_settings[`${rollType}_display_height`] = display_height;
  display_detection_settings[`${rollType}_display_scale`] = scale;
  display_detection_settings[`${rollType}_detection_x`] = detection_x;
  display_detection_settings[`${rollType}_detection_y`] = detection_y;
  display_detection_settings[`${rollType}_detection_width`] = detection_width;
  display_detection_settings[`${rollType}_detection_height`] = detection_height;
  display_detection_settings[`${rollType}_canvas_fps`] = 5;
  display_detection_settings[`${rollType}_pixel_threshold`] = 0.08;
  display_detection_settings[`${rollType}_read_delay`] = rollType === roll_type.SKILLS ? 0.5 : 1.2;
  return display_detection_settings;
};
const app_config_defaults = {
  wilds_aspect_ratio: "16:9",
  video_settings: {
    ...generate_default(roll_type.SKILLS, 1030, 358, 350, 70, 1.55, 0, 0, 20, 70),
    ...generate_default(roll_type.BONUSES, 1030, 440, 350, 160, 1.55, 0, 0, 20, 160)
  }
};
async function open_video_settings_window(rollType, child2, win2, VITE_DEV_SERVER_URL2, RENDERER_DIST2, dirname) {
  const configSettings = await get_video_settings();
  const state_settings = get_state_settings(configSettings, rollType);
  ipcMain.handle("get_vs_init_state", () => {
    return { ...state_settings, rollType };
  });
  child2 = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "icons/appicon.png"),
    parent: win2,
    modal: true,
    // Prevents using parent until child is closed
    show: false,
    // Start hidden for smoother loading
    width: configSettings.wilds_aspect_ratio === "16:9" ? 1380 : 1780,
    height: 920,
    webPreferences: {
      preload: path.join(dirname, "preload.mjs"),
      contextIsolation: true
    }
  });
  child2.setMenu(null);
  if (VITE_DEV_SERVER_URL2) {
    child2.loadURL(`${VITE_DEV_SERVER_URL2}/index_video_settings.html`);
  } else {
    child2.loadFile(path.join(RENDERER_DIST2, "index_video_settings.html"));
  }
  child2.webContents.openDevTools();
  child2.webContents.once("did-finish-load", () => {
    child2.webContents.send("initial-state", state_settings);
  });
  child2.on("ready-to-show", () => {
    child2.show();
  });
  child2.on("closed", () => {
    ipcMain.removeHandler("get_vs_init_state");
  });
}
async function get_video_settings() {
  try {
    const config_settings = await readFile("config.json", "utf-8").then((f) => JSON.parse(f));
    return config_settings;
  } catch (e) {
    console.log(e);
    if (e.code === "ENOENT") {
      await writeFile("config.json", JSON.stringify(app_config_defaults, null, 4));
    }
    return app_config_defaults;
  }
}
function get_state_settings(config, rollType) {
  const settings = {};
  const path2 = config.video_settings;
  settings.wilds_aspect_ratio = config.wilds_aspect_ratio;
  settings.display_x = path2[`${rollType}_display_x`];
  settings.display_y = path2[`${rollType}_display_y`];
  settings.display_width = path2[`${rollType}_display_width`];
  settings.display_height = path2[`${rollType}_display_height`];
  settings.detection_x = path2[`${rollType}_detection_x`];
  settings.detection_y = path2[`${rollType}_detection_y`];
  settings.detection_width = path2[`${rollType}_detection_width`];
  settings.detection_height = path2[`${rollType}_detection_height`];
  settings.canvas_fps = path2[`${rollType}_canvas_fps`];
  settings.pixel_threshold = path2[`${rollType}_pixel_threshold`];
  settings.read_delay = path2[`${rollType}_read_delay`];
  return settings;
}
function splitImageBuffer(img_buffer) {
  const fullImage = nativeImage.createFromBuffer(img_buffer, { width: 350, height: 160 });
  const baseRowsPerPiece = Math.floor(160 / 5);
  let remainderRows = 160 % 5;
  let currentTop = 0;
  const pieces = [];
  for (let i = 0; i < 5; i++) {
    const currentPieceHeight = baseRowsPerPiece + (remainderRows > 0 ? 1 : 0);
    remainderRows--;
    const croppedZone = fullImage.crop({
      x: 0,
      y: currentTop,
      width: 350,
      height: currentPieceHeight
    });
    const outputPngBuffer = croppedZone.toPNG();
    pieces.push({
      buffer: outputPngBuffer,
      width: 350,
      height: currentPieceHeight
    });
    currentTop += currentPieceHeight;
  }
  return pieces;
}
let tesseract_worker = null;
async function run_ocr(img_buffer, rollType) {
  if (!tesseract_worker) {
    tesseract_worker = await createWorker("eng");
    await tesseract_worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK
    });
  }
  try {
    if (rollType === roll_type.SKILLS) {
      const { data: { text } } = await tesseract_worker.recognize(img_buffer);
      return text.trim();
    } else {
      const img_buffers = splitImageBuffer(img_buffer);
      const texts = [];
      for (let i = 0; i < 5; i++) {
        const b = img_buffers[i];
        const { data: { text } } = await tesseract_worker.recognize(b.buffer);
        texts.push(text.trim());
      }
      return texts;
    }
  } catch (error) {
    console.error("OCR Failed: ", error);
    return "";
  }
}
async function init_app_state(db) {
  const allConfig = await get_video_settings();
  const videoSettings = { wilds_aspect_ratio: allConfig.wilds_aspect_ratio, video_settings: allConfig.video_settings };
  return { ...db.initialize_stats(), ...db.initialize_preferences(), vs: videoSettings };
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let child;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "icons/appicon.png"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs"),
      contextIsolation: true,
      webSecurity: true
    }
  });
  win.setMenu(null);
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.on("context-menu", (_, params) => {
    win?.webContents.inspectElement(params.x, params.y);
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.commandLine.appendSwitch("disable-features", "WindowsGraphicsCapture");
app.commandLine.appendSwitch("enable-usermedia-screen-capturing");
app.whenReady().then(() => {
  const dbPath = path.join(app.getPath("userData"), "gogmahelper.db");
  const db = new AppDatabase(new Database(dbPath));
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === "media" || permission === "display-capture") {
      callback(true);
    } else {
      callback(false);
    }
  });
  ipcMain.handle("initialize_app_state", () => init_app_state(db));
  ipcMain.handle("add_weapon_roller", (_, weapon, element, rollType) => db.add_weapon(weapon, element, rollType));
  ipcMain.handle("remove_weapon", (_, weapon, rollType) => db.remove_weapon(weapon, rollType));
  ipcMain.handle("remove_combo", (_, weapon, element, rollType) => db.remove_combo(weapon, element, rollType));
  ipcMain.handle("get_mh_wilds_window_id", async () => get_mh_wilds_window_id());
  ipcMain.handle("run_ocr", async (_, img_buffer, rollType) => run_ocr(img_buffer, rollType));
  ipcMain.handle("get_rolls", async (_, weapon, element, rollType) => db.get_rolls(weapon, element, rollType));
  ipcMain.handle("get_keep_rolls", async (_, keep_id) => db.get_keep_rolls(keep_id));
  ipcMain.handle("add_skill_roll", async (_, pid, roll, roll_exists) => db.add_skill_roll(pid, roll, roll_exists));
  ipcMain.handle("delete_skill_roll", async (_, pid, rollnum) => db.remove_skill_roll(pid, rollnum));
  ipcMain.handle("add_amend_roll", async (_, pid, roll, roll_exists) => db.add_amend_roll(pid, roll, roll_exists));
  ipcMain.handle("delete_amend_roll", async (_, pid, rollnum) => db.remove_amend_roll(pid, rollnum));
  ipcMain.handle("add_preference", async (_, rt, pref) => db.add_preference(rt, pref));
  ipcMain.handle("edit_preference", async (_, rt, orig, n) => db.edit_preference(rt, orig, n));
  ipcMain.handle("remove_preference", async (_, rt, pref) => db.remove_preference(rt, pref));
  ipcMain.on("open_video_settings", async (_, rollType) => open_video_settings_window(rollType, child, win, VITE_DEV_SERVER_URL, RENDERER_DIST, __dirname$1));
  createWindow();
}).catch((err) => {
  console.log(err);
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
