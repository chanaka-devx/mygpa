import { expect, test } from '@playwright/test'
import { buildSemesterWithGrades, seedApp } from './helpers'

const grades = [
  { id: '1', moduleName: 'Math', grade: 'A+', credit: 3 },
  { id: '2', moduleName: 'Physics', grade: 'B', credit: 3 },
  { id: '3', moduleName: 'Non GPA', grade: 'H-(NGPA)', credit: 2 },
]

test('analytics renders charts, target calculator, and what-if projection', async ({
  page,
}) => {
  await seedApp(page, { semesters: [buildSemesterWithGrades(grades)] })
  await page.goto('/dashboard/analytics')

  await expect(
    page.getByRole('heading', { name: 'Analytics & Progress' }),
  ).toBeVisible()
  await expect(page.getByText('GPA Trend')).toBeVisible()
  await expect(page.getByText('Grade Distribution')).toBeVisible()
  await expect(page.getByText('Credits per Semester')).toBeVisible()
  await expect(page.getByText('Target GPA Calculator')).toBeVisible()
  await expect(page.getByText('What-If Simulator')).toBeVisible()
  await expect(page.locator('.recharts-responsive-container')).toHaveCount(3)

  const targetInput = page.getByPlaceholder(/e.g. 3.50/)
  const remainingInput = page.getByPlaceholder('e.g. 45')

  await targetInput.fill('4')
  await remainingInput.fill('30')
  await expect(page.getByText('Not achievable')).toBeVisible()

  await targetInput.fill('3.6')
  await expect(page.getByText('Challenging but possible')).toBeVisible()

  await targetInput.fill('3.2')
  await expect(page.getByText('Achievable!')).toBeVisible()

  await page.getByRole('button', { name: '+ Add Hypothetical Semester' }).click()
  await expect(page.locator('table input[type="text"]')).toHaveValue('Semester 2')
  await expect(page.getByText('3.2500')).toBeVisible()

  const whatIfGpa = page.locator('table input[type="number"]').nth(1)
  await whatIfGpa.fill('4')
  await expect(page.getByText('3.7500')).toBeVisible()

  await page.getByTitle('Remove').click()
  await expect(page.locator('table input[type="text"]')).toBeHidden()
  await expect(page.getByText('Projected GPA')).toBeHidden()
})
