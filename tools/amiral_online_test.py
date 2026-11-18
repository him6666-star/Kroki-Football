# Amiral Batti online uctan uca testi: iki ayri tarayici oturumu canli siteye baglanir, eslesir, maci bitirir.
import asyncio, sys, time
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
            pg.on("console", lambda m, i=i: m.type in ("error", "warning") and errs[i].append(m.type + " " + m.text))
            await pg.goto(URL + "?lobby=test&t=" + str(time.time())); await pg.wait_for_timeout(1500)
            pages.append(pg)
        A, B = pages
        await A.click("#onlineBtn"); await A.wait_for_timeout(3000)
        print("A mm:", await A.inner_text("#mmText"))
        await B.click("#onlineBtn")
        for _ in range(60):
            ok = [await pg.evaluate("!!(typeof state!=='undefined'&&state.online&&ON.active&&ON.g&&ON.g.status==='setup')") for pg in pages]
            if all(ok): break
            await asyncio.sleep(0.5)
        print("matched:", ok, await A.evaluate("ON.gid"), await B.evaluate("ON.gid"))
        if not all(ok):
            print("ERRS", errs); sys.exit(1)
        # A rastgele dizip hazir, B hic dokunmadan bekleyip sure dolunca otomatik hazir olsun diye once A
        await A.click("#randomBtn"); await A.click("#startBtn")
        await B.click("#randomBtn"); await B.wait_for_timeout(500); await B.click("#startBtn")
        for _ in range(40):
            st = [await pg.evaluate("state.phase") for pg in pages]
            if st == ["battle", "battle"]: break
            await asyncio.sleep(0.5)
        print("battle:", st)
        ships = [await pg.evaluate("state.player.ships.flatMap(s=>s.cells)") for pg in pages]
        misses_left = {0: 3, 1: 3}
        frozen = False
        t0 = time.time(); shots = 0
        while time.time() - t0 < 600:
            ph = [await pg.evaluate("state.phase") for pg in pages]
            if "over" in ph:
                await asyncio.sleep(4)
                break
            if not frozen and shots >= 6:
                # B'nin sayfasi animasyon calistiramaz hale gelsin (arka plana atilmis gibi)
                await B.evaluate("window.requestAnimationFrame=()=>0")
                frozen = True; print("B animasyonlari donduruldu, shots", shots)
            for i, pg in enumerate(pages):
                can = await pg.evaluate("ON.g&&ON.g.turn===ON.uid&&!ON.g.pending&&!state.busy&&state.view==='enemy'")
                if not can: continue
                target = ships[1 - i]
                cell = await pg.evaluate("(arg)=>{const [t,miss]=arg; const sh=state.enemy.shots;"
                    "if(miss){for(let r=0;r<10;r++)for(let c=0;c<10;c++){ if(!sh[r][c]&&!t.some(x=>x[0]==r&&x[1]==c)) return [r,c]; }}"
                    "for(const [r,c] of t) if(!sh[r][c]) return [r,c]; return null;}", [target, misses_left[i] > 0])
                if misses_left[i] > 0: misses_left[i] -= 1
                if cell:
                    await pg.click(f'#enemy .cell[data-r="{cell[0]}"][data-c="{cell[1]}"]'); shots += 1
            await asyncio.sleep(0.4)
        for i, pg in enumerate(pages):
            r = await pg.evaluate("({phase:state.phase,result:document.getElementById('result').classList.contains('show'),title:document.getElementById('resTitle').textContent,"
                                  "shotsP:state.shotsP,hitsP:state.hitsP,enemySunk:state.enemy.ships.filter(s=>s.hits===s.size).length,enemyShipsKnown:state.enemy.ships.length,"
                                  "mySunk:state.player.ships.filter(s=>s.hits===s.size).length,status:ON.g&&ON.g.status,winnerIsMe:ON.g&&ON.g.winner===ON.uid})")
            print("PAGE", "AB"[i], r)
        print("total clicks", shots, "time", round(time.time() - t0))
        for i in range(2): print("ERRS", "AB"[i], errs[i][:15])
        # ikinci senaryo: rakip ayrilirsa
        await A.click("#resAgain"); await A.wait_for_timeout(2500); await B.click("#resAgain")
        for _ in range(40):
            ok = [await pg.evaluate("!!(ON.active&&ON.g&&ON.g.status==='setup')") for pg in pages]
            if all(ok): break
            await asyncio.sleep(0.5)
        print("rematch:", ok)
        await A.click("#randomBtn"); await A.click("#startBtn"); await B.click("#randomBtn"); await B.click("#startBtn")
        for _ in range(40):
            st = [await pg.evaluate("state.phase") for pg in pages]
            if st == ["battle", "battle"]: break
            await asyncio.sleep(0.5)
        print("rematch battle:", st)
        await asyncio.sleep(2)
        # B aniden kaybolur (sayfa kapandi / telefon kilitlendi)
        await B.context.close()
        t1 = time.time(); fired = False
        while time.time() - t1 < 120:
            if await A.evaluate("state.phase") == "over": break
            if not fired and await A.evaluate("ON.g&&ON.g.turn===ON.uid&&!ON.g.pending&&!state.busy"):
                await A.click('#enemy .cell[data-r="0"][data-c="0"]'); fired = True; print("A ates etti (cevap gelmeyecek)")
            await asyncio.sleep(1)
        print("B kayboldu, A:", round(time.time() - t1), "sn sonra", await A.evaluate("({phase:state.phase,title:resTitle.textContent,msg:document.getElementById('msg').textContent})"))
        await b.close()
asyncio.run(main())
