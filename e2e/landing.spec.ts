import { expect, test } from '@playwright/test'
import { seedApp } from './helpers'

test('landing page renders and demo sign in opens the dashboard', async ({ page }) => {
  await seedApp(page, { auth: false })
  await page.goto('/')

  await expect(
    page.getByRole('heading', { level: 1, name: /GPA Calc - Free Online/ }),
  ).toBeVisible()
  await expect(page.getByText('Trusted by 1015+ students worldwide')).toBeVisible()

  await page.getByRole('button', { name: 'Continue with Google' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: 'Current GPA :' })).toBeVisible()
})

test('unauthenticated dashboard visits redirect to the landing page', async ({ page }) => {
  await seedApp(page, { auth: false })
  await page.goto('/dashboard')

  await expect(page).toHaveURL(/\/$/)
  await expect(
    page.getByRole('heading', { level: 1, name: /GPA Calc - Free Online/ }),
  ).toBeVisible()
})
