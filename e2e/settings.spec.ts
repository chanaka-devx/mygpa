import { expect, test } from '@playwright/test'
import { buildSemester, seedApp, waitForCloudSave } from './helpers'

test('grade points and semester weights save and persist', async ({ page }) => {
  await seedApp(page, { semesters: [buildSemester(0)] })
  await page.goto('/dashboard/settings')

  await expect(page.getByRole('heading', { name: 'Grades' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Semester Weights' })).toBeVisible()

  await page.locator('#Aplus').fill('')
  await page.getByRole('button', { name: 'Save Changes' }).click()
  await expect(page.getByText('Point is required')).toBeVisible()

  await page.locator('#Aplus').fill('3.9')
  await page.locator('#weight-sem-1').fill('0.2')
  const saved = waitForCloudSave(page)
  await page.getByRole('button', { name: 'Save Changes' }).click()
  await expect(page.getByText('Grade scale updated successfully')).toBeVisible()
  await saved

  await page.reload()
  await expect(page.locator('#Aplus')).toHaveValue('3.9')
  await expect(page.locator('#weight-sem-1')).toHaveValue('0.2')
})
