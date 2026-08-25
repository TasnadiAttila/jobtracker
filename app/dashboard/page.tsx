import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StatusCell } from './status-cell'
import { AppliedAtCell } from './applied-at-cell'

const PAGE_SIZE = 9

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    location?: string
    type?: string
    salaryMin?: string
    salaryMax?: string
    postedFrom?: string
    postedTo?: string
    status?: string
    page?: string
  }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const params = await searchParams
  const query = params.q ?? ''
  const locationFilter = params.location ?? ''
  const typeFilter = params.type ?? ''
  const salaryMinFilter = params.salaryMin ?? ''
  const salaryMaxFilter = params.salaryMax ?? ''
  const postedFromFilter = params.postedFrom ?? ''
  const postedToFilter = params.postedTo ?? ''
  const statusFilter = params.status ?? ''
  const page = Math.max(1, Number(params.page ?? 1))

  const where = {
    AND: [
      query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' as const } },
              { company: { name: { contains: query, mode: 'insensitive' as const } } },
            ],
          }
        : {},
      locationFilter ? { location: locationFilter } : {},
      typeFilter === 'remote' ? { remote: true } : {},
      typeFilter === 'onsite' ? { remote: false } : {},
      // Salary: átfedés-alapú szűrés — a job sávja érintkezzen a megadott tartománnyal
      salaryMinFilter ? { salaryMax: { gte: Number(salaryMinFilter) } } : {},
      salaryMaxFilter ? { salaryMin: { lte: Number(salaryMaxFilter) } } : {},
      // Posted dátum tartomány
      postedFromFilter ? { postedAt: { gte: new Date(postedFromFilter) } } : {},
      postedToFilter ? { postedAt: { lte: new Date(postedToFilter) } } : {},
      // Státusz — a bejelentkezett user saját Application rekordjai alapján
      statusFilter === 'NONE'
        ? { applications: { none: { userId: session.user.id } } }
        : statusFilter
          ? { applications: { some: { userId: session.user.id, status: statusFilter as any } } }
          : {},
    ],
  }

  const [jobs, total, locations, applications] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { company: true },
      orderBy: { postedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.job.count({ where }),
    prisma.job.findMany({
      select: { location: true },
      distinct: ['location'],
      where: { location: { not: null } },
    }),
    prisma.application.findMany({
      where: { userId: session.user.id },
      select: { jobId: true, status: true, appliedAt: true },
    }),
  ])

  const applicationByJobId = new Map(applications.map((a) => [a.jobId, a]))

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const buildUrl = (overrides: Record<string, string | number>) => {
    const p = new URLSearchParams({
      ...(query ? { q: query } : {}),
      ...(locationFilter ? { location: locationFilter } : {}),
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(salaryMinFilter ? { salaryMin: salaryMinFilter } : {}),
      ...(salaryMaxFilter ? { salaryMax: salaryMaxFilter } : {}),
      ...(postedFromFilter ? { postedFrom: postedFromFilter } : {}),
      ...(postedToFilter ? { postedTo: postedToFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(page > 1 ? { page: String(page) } : {}),
      ...Object.fromEntries(Object.entries(overrides).map(([k, v]) => [k, String(v)])),
    })
    return `/dashboard?${p.toString()}`
  }

  return (
    <div className="min-h-screen bg-[#F1ECE3] px-6 py-10 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Fejléc */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="font-[family-name:var(--font-display)] font-semibold text-3xl text-[#1E2128]">
              Jobs
            </h1>
            <span className="font-[family-name:var(--font-mono)] text-xs bg-[#161A21] text-[#DB9A3C] px-2.5 py-1 rounded-full">
              {total} Active
            </span>
          </div>
          <Link
            href="/dashboard/jobs/new"
            className="bg-[#161A21] text-[#F6F2EA] text-sm font-medium px-4 py-2.5 rounded-md hover:bg-[#232833] transition-colors"
          >
            + Add Job
          </Link>
        </div>

        {/* Kereső + szűrők */}
        <form className="space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search jobs, companies…"
              className="flex-1 rounded-md border border-[#DDD5C7] bg-white px-4 py-2.5 text-sm text-[#1E2128] placeholder:text-[#B5AEA0] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40 focus:border-[#DB9A3C]"
            />

            <select
              name="location"
              defaultValue={locationFilter}
              className="rounded-md border border-[#DDD5C7] bg-white px-3 py-2.5 text-sm text-[#1E2128] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40"
            >
              <option value="">All Locations</option>
              {locations
                .filter((l) => l.location)
                .map((l) => (
                  <option key={l.location} value={l.location!}>
                    {l.location}
                  </option>
                ))}
            </select>

            <select
              name="type"
              defaultValue={typeFilter}
              className="rounded-md border border-[#DDD5C7] bg-white px-3 py-2.5 text-sm text-[#1E2128] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40"
            >
              <option value="">Any Type</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-[11px] text-[#8A8375] mb-1">Min Salary</label>
              <input
                type="number"
                name="salaryMin"
                defaultValue={salaryMinFilter}
                placeholder="$0"
                className="w-28 rounded-md border border-[#DDD5C7] bg-white px-3 py-2 text-sm text-[#1E2128] placeholder:text-[#B5AEA0] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#8A8375] mb-1">Max Salary</label>
              <input
                type="number"
                name="salaryMax"
                defaultValue={salaryMaxFilter}
                placeholder="$999,000"
                className="w-28 rounded-md border border-[#DDD5C7] bg-white px-3 py-2 text-sm text-[#1E2128] placeholder:text-[#B5AEA0] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#8A8375] mb-1">Posted from</label>
              <input
                type="date"
                name="postedFrom"
                defaultValue={postedFromFilter}
                className="rounded-md border border-[#DDD5C7] bg-white px-3 py-2 text-sm text-[#1E2128] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#8A8375] mb-1">Posted to</label>
              <input
                type="date"
                name="postedTo"
                defaultValue={postedToFilter}
                className="rounded-md border border-[#DDD5C7] bg-white px-3 py-2 text-sm text-[#1E2128] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#8A8375] mb-1">Status</label>
              <select
                name="status"
                defaultValue={statusFilter}
                className="rounded-md border border-[#DDD5C7] bg-white px-3 py-2 text-sm text-[#1E2128] focus:outline-none focus:ring-2 focus:ring-[#DB9A3C]/40"
              >
                <option value="">Any Status</option>
                <option value="NONE">Not tracked</option>
                <option value="SAVED">Saved</option>
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>

            <button
              type="submit"
              className="rounded-md border border-[#DDD5C7] bg-white px-4 py-2 text-sm text-[#1E2128] hover:bg-[#F6F2EA] transition-colors"
            >
              Filter
            </button>

            {(salaryMinFilter ||
              salaryMaxFilter ||
              postedFromFilter ||
              postedToFilter ||
              statusFilter ||
              locationFilter ||
              typeFilter ||
              query) && (
              <Link
                href="/dashboard"
                className="text-sm text-[#6B6459] hover:text-[#1E2128] transition-colors pb-2"
              >
                Clear filters
              </Link>
            )}
          </div>
        </form>

        {/* Táblázat */}
        <div className="bg-white rounded-lg border border-[#E5DFD3] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5DFD3] text-left text-xs text-[#8A8375] uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Salary Range</th>
                  <th className="px-5 py-3 font-medium">Posted</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Applied On</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const application = applicationByJobId.get(job.id)
                  return (
                    <tr
                      key={job.id}
                      className="border-b border-[#EFEAE0] last:border-0 hover:bg-[#FBF9F5] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#1E2128]">{job.title}</p>
                        <p className="text-xs text-[#8A8375] mt-0.5">{job.company.name}</p>
                      </td>
                      <td className="px-5 py-4 text-[#4B5563]">{job.location ?? '—'}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            job.remote
                              ? 'bg-[#DB9A3C]/15 text-[#B5792A]'
                              : 'bg-[#6B6459]/10 text-[#6B6459]'
                          }`}
                        >
                          {job.remote ? 'Remote' : 'On-site'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#4B5563]">
                        {job.salaryMin && job.salaryMax
                          ? `$${job.salaryMin.toLocaleString()} – $${job.salaryMax.toLocaleString()}`
                          : '—'}
                      </td>
                      <td className="px-5 py-4 text-[#4B5563]">
                        {job.postedAt
                          ? new Date(job.postedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <StatusCell jobId={job.id} initialStatus={application?.status ?? null} />
                      </td>
                      <td className="px-5 py-4">
                        <AppliedAtCell
                          jobId={job.id}
                          tracked={!!application}
                          initialAppliedAt={
                            application?.appliedAt
                              ? application.appliedAt.toISOString().slice(0, 10)
                              : null
                          }
                        />
                      </td>
                      <td className="px-5 py-4 text-right">
                        {job.url ? (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium border border-[#DDD5C7] rounded-md px-3 py-1.5 hover:bg-[#F6F2EA] transition-colors"
                          >
                            View Job
                          </a>
                        ) : (
                          <Link
                            href={`/dashboard/jobs/${job.id}`}
                            className="text-xs font-medium border border-[#DDD5C7] rounded-md px-3 py-1.5 hover:bg-[#F6F2EA] transition-colors"
                          >
                            View Job
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}

                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-[#8A8375]">
                      Nincs a szűrésnek megfelelő állás.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Lapozás */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-[#E5DFD3] text-sm text-[#6B6459]">
            <span>
              Showing {jobs.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{' '}
              {(page - 1) * PAGE_SIZE + jobs.length} of {total} jobs
            </span>

            <div className="flex items-center gap-2">
              <Link
                href={buildUrl({ page: Math.max(1, page - 1) })}
                aria-disabled={page === 1}
                className={`px-3 py-1.5 rounded-md border border-[#DDD5C7] ${
                  page === 1
                    ? 'opacity-40 pointer-events-none'
                    : 'hover:bg-[#F6F2EA] transition-colors'
                }`}
              >
                Previous
              </Link>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(0, 3)
                .map((p) => (
                  <Link
                    key={p}
                    href={buildUrl({ page: p })}
                    className={`px-3 py-1.5 rounded-md ${
                      p === page
                        ? 'bg-[#161A21] text-[#F6F2EA]'
                        : 'border border-[#DDD5C7] hover:bg-[#F6F2EA] transition-colors'
                    }`}
                  >
                    {p}
                  </Link>
                ))}

              <Link
                href={buildUrl({ page: Math.min(totalPages, page + 1) })}
                aria-disabled={page === totalPages}
                className={`px-3 py-1.5 rounded-md border border-[#DDD5C7] ${
                  page === totalPages
                    ? 'opacity-40 pointer-events-none'
                    : 'hover:bg-[#F6F2EA] transition-colors'
                }`}
              >
                Next
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}