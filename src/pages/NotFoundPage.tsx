import { Button, Center, Container, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconMoodSad } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export const NotFoundPage = () => {
  return (
    <Container size="sm" className={styles.page}>
        <Center className={styles.content}>
          <Stack align="center" gap="md">
            <IconMoodSad size={56} color="var(--mantine-color-blue-6)" />
            <Title order={1}>Страница не найдена</Title>
            <Text c="dimmed" ta="center">
              Возможно, адрес введён с ошибкой или страница была перемещена.
            </Text>
            <Button
              component={Link}
              to="/vacancies/moscow"
              leftSection={<IconArrowLeft size={16} />}
            >
              К списку вакансий
            </Button>
          </Stack>
        </Center>
    </Container>
  );
};
