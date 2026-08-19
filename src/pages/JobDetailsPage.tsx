import {
  Alert,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconBriefcase2,
  IconBuildingSkyscraper,
  IconMapPin,
  IconSchool,
  IconWallet,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Job } from '../types';
import styles from './JobDetailsPage.module.css';

interface JobDetails extends Omit<Job, 'skills'> {
  about_company?: string;
  description?: string;
  published_at?: string;
  short_description?: string;
  space?: 'remote' | 'office' | 'hybrid';
  skills?: string[] | string;
}

interface JobDetailsResponse {
  success: boolean;
  job?: JobDetails;
}

const formatLabels: Record<string, string> = {
  remote: 'Можно удалённо',
  office: 'Офис',
  hybrid: 'Гибрид',
};

const formatColors: Record<string, string> = {
  remote: 'green',
  hybrid: 'yellow',
  office: 'gray',
};

const getSkills = (skills?: string[] | string): string[] => {
  if (Array.isArray(skills)) return skills;
  return skills?.split(',').map((skill) => skill.trim()).filter(Boolean) ?? [];
};

const formatSalary = (salary?: string) => {
  if (!salary) return 'Зарплата не указана';
  const numericSalary = Number(salary);

  return Number.isFinite(numericSalary)
    ? `${numericSalary.toLocaleString('ru-RU')} ₽`
    : salary;
};

export const JobDetailsPage = () => {
  const { id } = useParams();
  const jobId = Number(id);
  const isValidJobId = Number.isInteger(jobId) && jobId > 0;
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    if (!isValidJobId) return () => controller.abort();

    const loadJob = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://kata-jobs.onrender.com/api/jobs/${jobId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Вакансия не найдена или сервис временно недоступен.');
        }

        const data = (await response.json()) as JobDetailsResponse;
        if (!data.success || !data.job) {
          throw new Error('Не удалось получить данные вакансии.');
        }

        setJob(data.job);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Не удалось загрузить вакансию.'
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadJob();
    return () => controller.abort();
  }, [isValidJobId, jobId]);

  const breadcrumbs = [
    <Link className={styles.breadcrumbLink} to="/vacancies/moscow" key="vacancies">
      Вакансии
    </Link>,
    <Text size="sm" c="dimmed" key="current">
      {job?.name ?? 'Вакансия'}
    </Text>,
  ];

  if (!isValidJobId) {
    return (
      <Container size="lg" className={styles.page}>
          <Alert color="red" title="Не удалось открыть вакансию" variant="light">
            <Stack gap="md">
              <Text>Некорректный идентификатор вакансии.</Text>
              <Box>
                <Button component={Link} to="/vacancies/moscow" leftSection={<IconArrowLeft size={16} />}>
                  К списку вакансий
                </Button>
              </Box>
            </Stack>
          </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container size="lg" className={styles.page}>
          <Center className={styles.loadingState}>
            <Loader size="lg" />
          </Center>
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container size="lg" className={styles.page}>
          <Alert color="red" title="Не удалось открыть вакансию" variant="light">
            <Stack gap="md">
              <Text>{error ?? 'Вакансия не найдена.'}</Text>
              <Box>
                <Button component={Link} to="/vacancies/moscow" leftSection={<IconArrowLeft size={16} />}>
                  К списку вакансий
                </Button>
              </Box>
            </Stack>
          </Alert>
      </Container>
    );
  }

  const jobFormat = job.space ?? job.format;
  const skills = getSkills(job.skills);

  return (
    <Container size="lg" className={styles.page}>
        <Breadcrumbs mb="lg">{breadcrumbs}</Breadcrumbs>

        <Card withBorder radius="lg" padding="xl" className={styles.heroCard}>
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start" wrap="wrap">
              <Box className={styles.titleBlock}>
                <Title order={1} className={styles.title}>
                  {job.name}
                </Title>
                <Group gap="xs" mt="sm">
                  <ThemeIcon variant="light" color="blue" radius="xl">
                    <IconBuildingSkyscraper size={16} />
                  </ThemeIcon>
                  <Text fw={600}>{job.company_name}</Text>
                  {job.city && (
                    <>
                      <Text c="dimmed">·</Text>
                      <Group gap={4}>
                        <IconMapPin size={16} color="var(--mantine-color-dimmed)" />
                        <Text c="dimmed">{job.city}</Text>
                      </Group>
                    </>
                  )}
                </Group>
              </Box>

              {jobFormat && (
                <Badge color={formatColors[jobFormat] ?? 'gray'} variant="light" size="lg">
                  {formatLabels[jobFormat] ?? jobFormat}
                </Badge>
              )}
            </Group>

            <Group gap="xl" wrap="wrap" className={styles.facts}>
              <Group gap="xs">
                <IconWallet size={20} color="var(--mantine-color-blue-6)" />
                <Box>
                  <Text size="xs" c="dimmed">Зарплата</Text>
                  <Text fw={700}>{formatSalary(job.salary)}</Text>
                </Box>
              </Group>
              <Group gap="xs">
                <IconSchool size={20} color="var(--mantine-color-blue-6)" />
                <Box>
                  <Text size="xs" c="dimmed">Опыт работы</Text>
                  <Text fw={700}>{job.experience ?? 'Не указан'}</Text>
                </Box>
              </Group>
              <Group gap="xs">
                <IconBriefcase2 size={20} color="var(--mantine-color-blue-6)" />
                <Box>
                  <Text size="xs" c="dimmed">Формат работы</Text>
                  <Text fw={700}>{jobFormat ? formatLabels[jobFormat] ?? jobFormat : 'Не указан'}</Text>
                </Box>
              </Group>
            </Group>
          </Stack>
        </Card>

        <Stack gap="lg" mt="lg">
          {job.short_description && (
            <Card withBorder radius="lg" padding="xl">
              <Title order={2} className={styles.sectionTitle}>О вакансии</Title>
              <Text className={styles.description}>{job.short_description}</Text>
            </Card>
          )}

          <Card withBorder radius="lg" padding="xl">
            <Title order={2} className={styles.sectionTitle}>Описание вакансии</Title>
            <Text className={styles.description}>
              {job.description ?? 'Работодатель не добавил подробное описание вакансии.'}
            </Text>

            {skills.length > 0 && (
              <>
                <Divider my="lg" />
                <Text fw={600} mb="sm">Ключевые навыки</Text>
                <Group gap="xs">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="light" color="blue" size="lg">
                      {skill}
                    </Badge>
                  ))}
                </Group>
              </>
            )}
          </Card>

          <Card withBorder radius="lg" padding="xl">
            <Title order={2} className={styles.sectionTitle}>О компании {job.company_name}</Title>
            <Text className={styles.description}>
              {job.about_company ?? 'Информация о компании пока не указана.'}
            </Text>
          </Card>
        </Stack>
    </Container>
  );
};
