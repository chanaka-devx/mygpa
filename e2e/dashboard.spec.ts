import { expect, test } from '@playwright/test'
import { buildSemester, seedApp } from './helpers'

test('banner dismissal persists and a default semester can be added', async ({ page }) => {
  await seedApp(page, { hasSeenNotification: false })
  await page.goto('/dashboard')

  const banner = page.getByText('Multiple GPA Calculation Methods Now Available!')
  await expect(banner).toBeVisible()
  await page.getByRole('button', { name: 'Got it' }).click()
  await expect(banner).toBeHidden()

  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(banner).toBeHidden()

  await page.getByRole('button', { name: 'Choose Default Semester' }).click()
  await expect(
    page.getByRole('heading', { name: 'Create Default Semester' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Default Semester 1', exact: true }).click()

  await expect(page.getByText('Default Semester 1 added successfully')).toBeVisible()
  await expect(page.locator('table tbody tr').first().locator('input').first()).toHaveValue(
    'Programming Fundamentals',
  )
  await expect(page.getByText(/Total Credits for Semester 1/)).toBeVisible()
})

test('semester validation and module CRUD work', async ({ page }) => {
  await seedApp(page, { semesters: [buildSemester(0)] })
  await page.goto('/dashboard')

  const firstModuleName = page.locator('table tbody tr').first().locator('input').first()
  await firstModuleName.fill('Programming 101')
  await page.getByRole('button', { name: 'Save module' }).first().click()
  await expect(page.getByText('Module updated successfully')).toBeVisible()
  await expect(firstModuleName).toHaveValue('Programming 101')

  await page.getByRole('button', { name: 'Add New Module' }).first().click()
  await expect(page.getByRole('heading', { name: 'Create Module' })).toBeVisible()
  await page.locator('#moduleName').selectOption({ label: 'Data Structures and Algorithms' })
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await expect(
    page.locator('table tbody tr').last().locator('input').first(),
  ).toHaveValue('Data Structures and Algorithms')

  await page.getByRole('button', { name: 'Delete module' }).first().click()
  await expect(page.getByRole('heading', { name: 'Delete Item' })).toBeVisible()
  await page.getByRole('button', { name: 'Yes, Delete' }).click()
  await expect(page.getByText('Module deleted successfully')).toBeVisible()
  await expect(firstModuleName).not.toHaveValue('Programming 101')

  await page.getByRole('button', { name: 'Add New Semester' }).click()
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByText('Semester name is required')).toBeVisible()

  await page.locator('#semesterName').fill('Summer 2026')
  await page.locator('#weight').fill('11')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByText('Weight cannot exceed 10')).toBeVisible()

  await page.locator('#weight').fill('0.2')
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.getByText('New semester added successfully')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Summer 2026', exact: true }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Delete Summer 2026' }).click()
  await page.getByRole('button', { name: 'Yes, Delete' }).click()
  await expect(page.getByText('Semester deleted successfully')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Summer 2026', exact: true }),
  ).toBeHidden()
})

test('the GPA calculation method can be switched', async ({ page }) => {
  await seedApp(page, { semesters: [buildSemester(0)] })
  await page.goto('/dashboard')

  await page.locator('#gpa-calc-method').selectOption('credit-weighted')
  await expect(
    page.getByText('Switched to Weighted Module CGPA calculation'),
  ).toBeVisible()
  await expect(page.getByText('Weighted Module CGPA', { exact: true }).first()).toBeVisible()
})
