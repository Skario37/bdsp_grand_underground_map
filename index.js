const MARKS = ["zone_1","zone_2","zone_3","zone_4","zone_5","zone_6","zone_7","zone_8","zone_9","zone_10","zone_11","zone_12","zone_13","zone_14","zone_15","zone_16","zone_17","zone_18","zone_19","zone_20",]
let Master = undefined;
let Monsters = undefined;
let Moves = undefined;

const tables = new Map();

let activeMarks = undefined;
let activeMark = undefined;
let overMarks = undefined;


unsetActiveMarks = (e) => {
    activeMark = undefined;
    document.activeElement.blur();
    for (const mark of activeMarks) {
        mark.dataset.markActive = "false";
    }
}

setActiveMarksByElement = (e) => {
    activeMark = e.dataset.mark;
    activeMarks = e.parentElement.getElementsByClassName(e.dataset.mark);
    for (const mark of activeMarks) {
        mark.dataset.markActive = "true";
    }
}

unsetOverMarks = (e) => {
    for (const mark of overMarks) {
        mark.dataset.markOver = "false";
    }
}

setOverMarksByElement = (e) => {
    overMarks = e.parentElement.getElementsByClassName(e.dataset.mark);
    for (const mark of overMarks) {
        mark.dataset.markOver = "true";
    }
}

handleActiveMarks = (e) => {
    if (e.dataset.mark === activeMark) {
        unsetActiveMarks();
    } else {
        if (activeMarks) unsetActiveMarks(); 
        setActiveMarksByElement(e);
    }
    handleTables();
}

getJson = async (json) => {
    return await fetch(json)
        .then(response => response.json())
        .then(json => json);
}

getZukan = (z) => {
    if (z === 1) return "Début";
    else if (z === 2) return "Force";
    else if (z === 3) return "Anti-Brouillard";
    else if (z === 4) return "7 Badges";
    else if (z === 5) return "Cascade";
    else if (z === 6) return "Pokédex National";
}

getVersion = (v) => {
    if (v === 1) return "";
    else if (v === 2) return "DB";
    else if (v === 3) return "PS";
}

// Work can be done to get available moves instead of unavailable ones
getUnavailableMoves = (n) => {
    const unavail_moves = Master.ignore_move.find(e => e.MonsNo === n);
    let txt_moves = "";
    if (unavail_moves) {
        for (const move of unavail_moves.Waza) {
            if (move !== 0) txt_moves += Moves[move].wordDataArray[0].str + ", ";
        }
        txt_moves = txt_moves.slice(0, -2);
    }
    return txt_moves;
}

createThead = (name) => {
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.colSpan = "4";
    th.innerText = name;

    const tr2 = document.createElement("tr");
    for (const head of ["Pokémon", "Version", "Capacité Œuf Indisponible", "Disponibilité"]) {
        const th2 = document.createElement("th");
        th2.innerText = head;
        tr2.appendChild(th2);
    }

    tr.appendChild(th);
    thead.appendChild(tr);
    thead.appendChild(tr2);
    return thead;
}

createTbody = (zone) => {
    const tbody = document.createElement("tbody");
    for (const sm of zone.specialmons) {
        const tr = document.createElement("tr");

        const td1       = document.createElement("td");
        const div_sm    = document.createElement("div");
        const img_sm    = document.createElement("img");
        const name_sm   = document.createElement("p");
        img_sm.src = "./images/pm/" + sm.monsno + ".png"
        name_sm.innerText = Monsters[sm.monsno].wordDataArray[0].str;

        const td2           = document.createElement("td");
        const div_version   = document.createElement("div");
        const d             = document.createElement("p");
        const p             = document.createElement("p");
        d.classList.add("vers_d");
        p.classList.add("vers_p");
        d.innerText = `${sm.Dspecialrate / 10}%`;
        p.innerText = `${sm.Pspecialrate / 10}%`;

        const td3   = document.createElement("td");
        const p_imv = document.createElement("p");
        p_imv.classList.add("move");
        p_imv.innerText = getUnavailableMoves(sm.monsno);

        const td4     = document.createElement("td");
        const p_avail = document.createElement("p");
        p_avail.classList.add("zukan_0");
        p_avail.innerText = "Spécial";

        tbody.appendChild(tr);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        td1.appendChild(div_sm);
        div_sm.appendChild(img_sm);
        div_sm.appendChild(name_sm);
        td2.appendChild(div_version);
        div_version.appendChild(d);
        div_version.appendChild(p);
        td3.appendChild(p_imv);
        td4.appendChild(p_avail);
    }

    const mons = sortMons(zone.mons); // Sort monsters by order of unblocking them
    for (const m of mons) {
        const tr = document.createElement("tr");

        const td1       = document.createElement("td");
        const div_m    = document.createElement("div");
        const img_m    = document.createElement("img");
        const name_m   = document.createElement("p");
        img_m.src = "./images/pm/" + m.monsno + ".png"
        name_m.innerText = Monsters[m.monsno].wordDataArray[0].str;

        const td2           = document.createElement("td");
        const p_version   = document.createElement("p");
        p_version.classList.add("vers_" + m.version);
        p_version.innerText = getVersion(m.version);

        const td3   = document.createElement("td");
        const p_imv = document.createElement("p");
        p_imv.classList.add("move");
        p_imv.innerText = getUnavailableMoves(m.monsno);

        const td4     = document.createElement("td");
        const p_avail = document.createElement("p");
        p_avail.classList.add("zukan_" + m.zukanflag);
        p_avail.innerText = getZukan(m.zukanflag);

        tbody.appendChild(tr);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        td1.appendChild(div_m);
        div_m.appendChild(img_m);
        div_m.appendChild(name_m);
        td2.appendChild(p_version);
        td3.appendChild(p_imv);
        td4.appendChild(p_avail);
    }
    return tbody;
}

sortMons = (mons) => mons.sort((a, b) => a.zukanflag - b.zukanflag);

addTable = (zone) => {
    const div = document.getElementById("ug_zone");
    const table = document.createElement("table");
    const thead = createThead(zone.str);
    const tbody = createTbody(zone);

    table.appendChild(thead);
    table.appendChild(tbody);

    div.appendChild(table);
    // If digglet is needed in first position, uncomment below and comment above
    // Guess Zone 20 is for the normal hallways
    // if (zone.id !== 20) div.appendChild(table);
    // else div.insertBefore(table, div.firstChild);

    return table;
}

handleTables = () => {
    if (!activeMark) {
        if (tables.size) { 
            for (const value of tables.values()) {
                value.style.display = "none";
            }
            for (const value of tables.values()) {
                value.style.display = "table";
            }
        } else { // First construct all tables then we will reuse tables instead of destruct and recreate them
            for (const mark of MARKS) {
                tables.set(mark, addTable(Master[mark]));
            }
        }
    } else {
        for (const [key, value] of tables) {
            if (key === activeMark) value.style.display = "table";
            else value.style.display = "none";
        }
    }
}

document.addEventListener('DOMContentLoaded', async (event) => {
    const zones = document.getElementsByClassName("zone");
    for (const zone of zones) {
        zone.addEventListener("mouseenter", () => setOverMarksByElement(zone));
        zone.addEventListener("mouseleave", () => unsetOverMarks());
        zone.addEventListener("mousedown", () => handleActiveMarks(zone));
    }

    Master = await getJson("./resources/ug_master.json");
    Monsters = (await getJson("./resources/french_ss_monsname.json")).labelDataArray;
    Moves = (await getJson("./resources/french_ss_wazaname.json")).labelDataArray;
    
    handleTables();
});