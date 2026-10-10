import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(userId: number) {
    const [tasks, projects, jobApplications, skills] = await Promise.all([
      this.prisma.task.findMany({ where: { userId } }),
      this.prisma.project.findMany({ where: { userId } }),
      this.prisma.jobApplication.findMany({ where: { userId } }),
      this.prisma.skill.findMany({ where: { userId } }),
    ]);

    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED').length;
    const dailyTasksCount = tasks.filter((t) => t.isDaily).length;

    const inProgressProjects = projects.filter(
      (p) => p.status === 'IN_PROGRESS',
    ).length;
    const completedProjects = projects.filter(
      (p) => p.status === 'COMPLETED',
    ).length;

    const appliedJobs = jobApplications.filter(
      (j) => j.status === 'APPLIED',
    ).length;
    const interviewJobs = jobApplications.filter(
      (j) => j.status === 'INTERVIEW' || j.status === 'SCREENING',
    ).length;
    const offerJobs = jobApplications.filter(
      (j) => j.status === 'OFFER',
    ).length;

    const totalSkillProgress = skills.reduce(
      (sum, s) => sum + s.progressPercentage,
      0,
    );
    const averageSkillProgress =
      skills.length > 0 ? Math.round(totalSkillProgress / skills.length) : 0;

    return {
      tasks: {
        total: tasks.length,
        completed: completedTasks,
        pending: pendingTasks,
        dailyTasksCount,
      },
      projects: {
        total: projects.length,
        inProgress: inProgressProjects,
        completed: completedProjects,
      },
      jobApplications: {
        total: jobApplications.length,
        applied: appliedJobs,
        interviews: interviewJobs,
        offers: offerJobs,
      },
      skills: {
        total: skills.length,
        averageProgress: averageSkillProgress,
      },
    };
  }
}
