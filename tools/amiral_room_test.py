# Arkadasla oyna + rovans + siralama uctan uca testi (canli site, gercek Firestore)
import asyncio, sys, time, json
from playwright.async_api import async_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "https://amiral-batti.web.app"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pages, errs = [], {0: [], 1: []}
        for i in range(2):
            ctx = await b.new_context(viewport={"width": 390, "height": 844})
            pg = await ctx.new_page()
            pg.on("pageerror", lambda e, i=i: errs[i].append("PAGEERROR " + str(e)))
            pg.on("console", lambda m, i=i: m.type == "error" and errs[i].append(m.text[:160]))
            await pg.goto(URL + "?t=" + str(time.time())); await pg.wait_for_timeout(2500)
            pages.append(pg)
        A, B = pages
        for i, pg in enumerate(pages):
            await pg.evaluate(f"PROF.d.name='TestBot{'AB'[i]}'; PROF.save()")
        await A.click("#friendBtn"); await A.click("#roomCreate")
        for _ in range(30):
            code = await A.inner_text("#roomCodeBig")
            if code.strip().isdigit(): break
            await asyncio.sleep(0.5)
        print("oda kodu:", code, "| wa linki:", (await A.get_attribute("#roomWa", "href"))[:60])
        # B davet linkiyle gelsin
        await B.goto(URL + "?oda=" + code); await B.wait_for_timeout(2500)
        print("B link açılışı:", await B.input_value("#roomCode"), "|", await B.inner_text("#roomMsg"))
        await B.click("#roomJoin")
        for _ in range(40):
            ok = [await pg.evaluate("!!(ON.active&&ON.g&&ON.g.status==='setup')") for pg in pages]
            if all(ok): break
            await asyncio.sleep(0.5)
        print("eşleşti:", ok, await A.evaluate("ON.gid") == await B.evaluate("ON.gid"))
        print("rakip etiketi A:", await A.inner_text("#foeLabel"), "| B:", await B.inner_text("#foeLabel"))
        uids = [await pg.evaluate("ON.uid") for pg in pages]
        json.dump(uids, open("test_uids.json", "w"))
        async def play_until_over(winner_i):
            for pg in pages: await pg.click("#randomBtn"); await pg.click("#startBtn")
            for _ in range(60):
                if [await pg.evaluate("state.phase") for pg in pages] == ["battle", "battle"]: break
                await asyncio.sleep(0.5)
            target = await pages[1 - winner_i].evaluate("state.player.ships.flatMap(s=>s.cells)")
            t0 = time.time()
            while time.time() - t0 < 300:
                if "over" in [await pg.evaluate("state.phase") for pg in pages]: break
                for i, pg in enumerate(pages):
                    if not await pg.evaluate("ON.g&&ON.g.turn===ON.uid&&!ON.g.pending&&!state.busy&&state.view==='enemy'"): continue
                    if i == winner_i:
                        cell = await pg.evaluate("(t)=>{for(const [r,c] of t) if(!state.enemy.shots[r][c]) return [r,c]; return null}", target)
                    else:   # kaybeden hep iska
                        cell = await pg.evaluate("(()=>{for(let r=9;r>=0;r--)for(let c=9;c>=0;c--) if(!state.enemy.shots[r][c]) return [r,c];})()")
                    if cell: await pg.click(f'#enemy .cell[data-r="{cell[0]}"][data-c="{cell[1]}"]')
                await asyncio.sleep(0.4)
            await asyncio.sleep(4.5)
        await play_until_over(0)
        for i, pg in enumerate(pages):
            print("PAGE", "AB"[i], await pg.evaluate("({phase:state.phase,result:document.getElementById('result').classList.contains('show'),title:document.getElementById('resTitle').textContent,xp:document.getElementById('xpRes').innerText,rematch:getComputedStyle(document.getElementById('rematchBox')).display,why:ON.g&&ON.g.why})"))
        await asyncio.sleep(3)
        # rövanş
        await B.click("#rematchBtn", force=True); await asyncio.sleep(2)
        print("A rövanş mesajı:", await A.inner_text("#rematchMsg"))
        old = await A.evaluate("ON.gid")
        await A.click("#rematchBtn", force=True)
        for _ in range(30):
            ok = [await pg.evaluate("!!(ON.active&&ON.g&&ON.g.status==='setup'&&state.phase==='setup')") for pg in pages]
            if all(ok): break
            await asyncio.sleep(0.5)
        print("rövanş başladı:", ok, "yeni maç farklı:", await A.evaluate("ON.gid") != old, "aynı maç:", await A.evaluate("ON.gid") == await B.evaluate("ON.gid"))
        # sıralama
        await B.click("#homeBtn"); await B.wait_for_timeout(300); await B.click("#quitYes"); await asyncio.sleep(3)
        await A.click("#resMenu") if await A.evaluate("document.getElementById('result').classList.contains('show')") else None
        await A.evaluate("document.getElementById('result').classList.remove('show'); leaveOnline(false); show('menu')")
        await A.click("#boardBtn"); await asyncio.sleep(3)
        print("sıralama:", (await A.inner_text("#bdList")).replace("\n", " | ")[:300])
        print("profil A:", await A.evaluate("JSON.stringify({xp:PROF.d.xp,onlineWins:PROF.d.onlineWins,rank:PROF.rank()})"))
        for i in range(2): print("ERRS", "AB"[i], errs[i][:8])
        json.dump(uids, open("test_uids.json", "w")); print("uids", uids)
        await b.close()
asyncio.run(main())
