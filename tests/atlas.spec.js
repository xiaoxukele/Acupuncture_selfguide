import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.goto('/');await expect(page.locator('#condition-detail h2')).toHaveText('腰背痛')});
test('search, region filters and empty state',async({page})=>{
 await page.locator('#search').fill('LI4');await expect(page.locator('.condition-row')).toHaveCount(3);
 await page.locator('#search').fill('神门');await expect(page.locator('.condition-row')).toHaveCount(3);
 await page.locator('#search').fill('没有这种病痛');await expect(page.locator('#condition-list')).toContainText('没有找到');
 await page.locator('[data-clear]').click();await expect(page.locator('.condition-row')).toHaveCount(14);
 await page.locator('[data-region="颈肩"]').click();await expect(page.locator('.condition-row')).toHaveCount(2);
 await page.keyboard.press('/');await expect(page.locator('#search')).toBeFocused();
});
test('body and ear point selection, hidden surface, keyboard and zoom',async({page})=>{
 await page.locator('[data-condition="shoulder-pain"]').click();await expect(page.locator('#figure-title')).toHaveText('人体正面');
 await page.locator('[data-system="ear"]').click();await expect(page.locator('#figure-title')).toHaveText('耳郭外侧');
 await expect(page.locator('[data-marker="ear-shoulder"]')).toHaveClass(/related/);
 await page.locator('[data-condition="insomnia"]').click();await page.locator('[data-point="ear-subcortex"]').first().click();
 await expect(page.locator('.selected-point')).toContainText('皮质下');await expect(page.locator('#hidden-points')).toBeVisible();await expect(page.locator('[data-marker="ear-subcortex"]')).toHaveCount(0);
 await page.locator('[data-system="body"]').click();await expect(page.locator('#figure-title')).toHaveText('人体正面');
 await page.locator('[data-marker="body-pc6"]').focus();await page.keyboard.press('Enter');await expect(page.locator('.selected-point strong')).toHaveText('内关');
 await page.locator('#zoom-in').click();await expect(page.locator('#zoom-reset')).toHaveText('120%');await page.locator('#zoom-reset').click();await expect(page.locator('#zoom-reset')).toHaveText('100%');
});
test('favorites persist and catalog opens selected condition',async({page})=>{
 await page.locator('#save-condition').click();await expect(page.locator('#favorite-count')).toHaveText('1');
 await page.reload();await page.locator('[data-page="favorites"]').click();await expect(page.locator('.catalog-row')).toHaveCount(1);await expect(page.locator('.catalog-row h3')).toHaveText('腰背痛');
 await page.locator('[data-open-condition="low-back-pain"]').click();await expect(page.locator('#atlas-page')).toBeVisible();
 await page.locator('#save-condition').click();await expect(page.locator('#favorite-count')).toHaveText('0');
 await page.locator('[data-page="index"]').click();await expect(page.locator('.catalog-row')).toHaveCount(14);
});
test('sources, evidence, safety, theme and screenshots',async({page})=>{
 await page.locator('#condition-sources').click();await expect(page.locator('dialog')).toBeVisible();await expect(page.locator('.source-record')).toHaveCount(3);await expect(page.locator('dialog')).toContainText('腰背痛');await page.keyboard.press('Escape');
 await page.locator('#evidence-button').click();await expect(page.locator('dialog')).toContainText('不能互换');await page.locator('#close-dialog').click();
 await page.locator('#about-button').click();await expect(page.locator('dialog')).toContainText('不用于诊断');await page.keyboard.press('Escape');
 await page.locator('#condition-detail h2').click();await page.screenshot({path:'tests/desktop-light.png',fullPage:true,animations:'disabled'});
 await page.locator('#theme-button').click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.screenshot({path:'tests/desktop-dark.png',fullPage:true,animations:'disabled'});
 await page.locator('#theme-button').click();await page.locator('[data-system="ear"]').click();await page.screenshot({path:'tests/desktop-ear.png',fullPage:true,animations:'disabled'});
});
test('every condition renders both systems without browser errors',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const ids=await page.locator('.condition-row').evaluateAll(rows=>rows.map(r=>r.dataset.condition));
 for(const id of ids){await page.locator(`[data-condition="${id}"]`).click();await expect(page.locator('#condition-detail h2')).not.toBeEmpty();await page.locator('#ear-tab').click();await expect(page.locator('#figure svg')).toHaveCount(1);await page.locator('#body-tab').click()}
 expect(errors).toEqual([]);
});
test('responsive layout and usable mobile flows',async({page})=>{
 for(const width of [390,768,1024]){await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'tests/mobile.png',fullPage:true});
 await page.locator('[data-condition="headache"]').click();await page.locator('#ear-tab').click();await expect(page.locator('#figure-title')).toHaveText('耳郭外侧');
 await page.locator('#save-condition').click();await page.locator('[data-page="favorites"]').click();await expect(page.locator('.catalog-row')).toHaveCount(1);
});
