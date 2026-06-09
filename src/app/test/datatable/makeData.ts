import { SortingState } from '@tanstack/react-table'

// ─── Types ───────────────────────────────────────────────────────

export interface Person {
  id: number
  firstName: string
  lastName: string
  age: number
  visits: number
  status: string
  progress: number
  createdAt: Date
}

// ─── Seeded PRNG ─────────────────────────────────────────────────

let seed = 42

function seededRandom() {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(seededRandom() * arr.length)]
}

function randInt(min: number, max: number) {
  return Math.floor(seededRandom() * (max - min + 1)) + min
}

// ─── Data generation ─────────────────────────────────────────────

const statuses = ['relationship', 'complicated', 'single'] as const

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael',
  'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan',
  'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen',
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
]

export function makeData(count: number): Person[] {
  // Reset seed for reproducibility
  seed = 42

  const data: Person[] = []
  for (let i = 0; i < count; i++) {
    data.push({
      id: i + 1,
      firstName: pickOne(firstNames),
      lastName: pickOne(lastNames),
      age: randInt(18, 80),
      visits: randInt(0, 1000),
      status: pickOne(statuses),
      progress: randInt(0, 100),
      createdAt: new Date(
        Date.now() - randInt(0, 365 * 3) * 24 * 60 * 60 * 1000,
      ),
    })
  }
  return data
}
