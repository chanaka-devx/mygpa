import { expect, test } from '@playwright/test'
import { seedApp } from './helpers'

test('feedback validates and stores a submission', async ({ page }) => {
  await seedApp(page)
  await page.goto('/dashboard/feedback')

  await expect(page.getByRole('heading', { name: 'Feedback' })).toBeVisible()
  await page.getByRole('button', { name: 'Submit Feedback' }).click()
  await expect(page.getByText('Feedback cannot be empty.')).toBeVisible()

  await page.locator('#description').fill('The analytics page is useful.')
  await page.getByRole('button', { name: 'Submit Feedback' }).click()
  await expect(page.getByText('Feedback submitted successfully!')).toBeVisible()
  await expect(page.locator('#description')).toHaveValue('')

  const stored = await page.evaluate(() => {
    const raw = window.localStorage.getItem('gpa-data')
    return raw ? JSON.parse(raw).state.feedback[0].description : null
  })
  expect(stored).toBe('The analytics page is useful.')
})

test('help guide renders', async ({ page }) => {
  await seedApp(page)
  await page.goto('/dashboard/help')

  await expect(
    page.getByRole('heading', { name: 'MCM GPA Help Guide' }),
  ).toBeVisible()
  await expect(page.getByText('Getting Started')).toBeVisible()
  await expect(page.getByText('Managing Modules/Courses')).toBeVisible()
})
