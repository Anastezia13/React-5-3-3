import { Anchor, Box, Button, Group, Text } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { Link, useMatch } from 'react-router-dom';
import styles from './Header.module.css';

export const Header = () => {
  const vacanciesRootMatch = useMatch('/vacancies');
  const vacanciesNestedMatch = useMatch('/vacancies/*');
  const aboutMatch = useMatch('/about');
  const isVacanciesActive = Boolean(vacanciesRootMatch || vacanciesNestedMatch);
  const isAboutActive = Boolean(aboutMatch);

  return (
    <Box className={styles.header}>
      <Group justify="space-between">
        <Group gap="xs">
          <Box className={styles.logoCircle}>hh</Box>
          <Text size="lg" fw={500} c="dimmed" className={styles.logoText}>FrontEnd</Text>
        </Group>

        <Group gap="xl">
          <Anchor
            component={Link}
            to="/vacancies/moscow"
            className={`${styles.menuLink} ${isVacanciesActive ? styles.menuLinkActive : ''}`}
          >
            Вакансии FE
          </Anchor>
          <Button
            component={Link}
            to="/about"
            variant="subtle"
            color={isAboutActive ? 'blue' : 'gray'}
            leftSection={<IconUser size={16} />}
            className={`${styles.menuButton} ${isAboutActive ? styles.menuButtonActive : ''}`}
          >
            Обо мне
          </Button>
        </Group>
      </Group>
    </Box>
  );
};
