import { Badge, Box, Card, Container, Group, List, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconCode, IconDeviceLaptop, IconRocket } from '@tabler/icons-react';
import styles from './AboutPage.module.css';

export const AboutPage = () => {
  return (
    <Container size="md" className={styles.page}>
      <Card withBorder radius="lg" padding="xl" className={styles.card}>
        <Stack gap="lg">
          <Group gap="md">
            <ThemeIcon size={54} radius="xl" variant="light" color="blue">
              <IconDeviceLaptop size={28} />
            </ThemeIcon>
            <Box>
              <Title order={1}>Обо мне</Title>
              <Text c="dimmed">Начинающий Frontend-разработчик</Text>
            </Box>
          </Group>

          <Text className={styles.text}>
            Я изучаю React, TypeScript и современную веб-разработку. Мне интересно
            создавать понятные интерфейсы, работать с маршрутизацией, API и состоянием приложения.
          </Text>

          <Box>
            <Text fw={700} mb="sm">Мои навыки</Text>
            <Group gap="xs">
              {['React', 'TypeScript', 'Redux Toolkit', 'React Router', 'HTML', 'CSS'].map((skill) => (
                <Badge key={skill} color="blue" variant="light" size="lg">
                  {skill}
                </Badge>
              ))}
            </Group>
          </Box>

          <List
            spacing="sm"
            icon={
              <ThemeIcon color="blue" size={22} radius="xl">
                <IconCode size={14} />
              </ThemeIcon>
            }
          >
            <List.Item>Создаю адаптивные интерфейсы на React и Mantine.</List.Item>
            <List.Item>Работаю с REST API, фильтрами и параметрами URL.</List.Item>
            <List.Item
              icon={
                <ThemeIcon color="green" size={22} radius="xl">
                  <IconRocket size={14} />
                </ThemeIcon>
              }
            >
              Продолжаю развивать портфолио учебными проектами.
            </List.Item>
          </List>
        </Stack>
      </Card>
    </Container>
  );
};
