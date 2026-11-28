import { expect, test } from '@playwright/test'
import { buildSemester, seedApp } from './helpers'

test.use({ viewport: { width: 390, height: 844 } })

test('mobile navigation opens and routes correctly', async ({ page }) => {
  await seedApp(page, { semesters: [buildSemester(0)] })
  await page.goto('/dashboard')

  await expect(page.getByText('MCM GPA').first()).toBeVisible()
  await page.getByRole('button', { name: 'Open menu' }).click()

  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Analytics' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Help' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Feedback' })).toBeVisible()

  await page.getByRole('link', { name: 'Analytics' }).click()
  await expect(page).toHaveURL(/\/dashboard\/analytics$/)
  await expect(
    page.getByRole('heading', { name: 'Analytics & Progress' }),
  ).toBeVisible()
})
