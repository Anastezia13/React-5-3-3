import {
  Alert,
  Box,
  Button,
  Center,
  Container,
  Group,
  Loader,
  MantineProvider,
  Pagination,
  Stack,
  Tabs,
  Text,
  TextInput,
  createTheme,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useRef } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { Filters } from './components/Filters';
import { JobCard } from './components/JobCard';
import { Layout } from './layouts/Layout';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { AboutPage } from './pages/AboutPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { fetchJobs } from './store/jobsSlice';
import {
  addSkill,
  hydrateFilters,
  removeSkill,
  setPage,
  setSearch,
  type FiltersState,
} from './store/filtersSlice';
import '@mantine/core/styles.css';
import styles from './App.module.css';

const theme = createTheme({
  primaryColor: 'blue',
});

const cityRoutes = {
  moscow: 'Москва',
  petersburg: 'Санкт-Петербург',
} as const;

type CityRoute = keyof typeof cityRoutes;

const getFiltersFromUrl = (params: URLSearchParams, city: string): FiltersState => {
  const requestedPage = Number(params.get('page'));
  const skills = (params.get('skills') ?? '')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  return {
    search: params.get('search') ?? '',
    city,
    skills: [...new Set(skills)],
    page: Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
  };
};

const areFiltersEqual = (left: FiltersState, right: FiltersState) =>
  left.search === right.search &&
  left.city === right.city &&
  left.page === right.page &&
  left.skills.length === right.skills.length &&
  left.skills.every((skill, index) => skill === right.skills[index]);

const getUrlFromFilters = ({ search, skills, page }: FiltersState) => {
  const params = new URLSearchParams();

  if (search) params.set('search', search);
  if (skills.length > 0) params.set('skills', skills.join(','));
  if (page > 1) params.set('page', String(page));

  return params;
};

interface CityVacanciesPageProps {
  cityRoute: CityRoute;
}

const CityVacanciesPage = ({ cityRoute }: CityVacanciesPageProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, loading, error, pages } = useAppSelector((state) => state.jobs);
  const filters = useAppSelector((state) => state.filters);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const [debouncedSearch] = useDebouncedValue(filters.search, 300);
  const filtersRef = useRef(filters);
  const urlFiltersRef = useRef(getFiltersFromUrl(searchParams, cityRoutes[cityRoute]));
  const isHydratingFromUrlRef = useRef(true);
  const skillsKey = filters.skills.join('\u0000');
  const activeCity = cityRoutes[cityRoute];

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    const urlFilters = getFiltersFromUrl(new URLSearchParams(queryString), activeCity);
    urlFiltersRef.current = urlFilters;
    isHydratingFromUrlRef.current = true;

    if (!areFiltersEqual(filtersRef.current, urlFilters)) {
      dispatch(hydrateFilters(urlFilters));
    }
  }, [activeCity, cityRoute, dispatch, queryString]);

  useEffect(() => {
    if (isHydratingFromUrlRef.current) {
      if (areFiltersEqual(filters, urlFiltersRef.current)) {
        isHydratingFromUrlRef.current = false;
      }
      return;
    }

    const nextParams = getUrlFromFilters({ ...filters, search: debouncedSearch });
    if (nextParams.toString() !== queryString) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [debouncedSearch, filters, queryString, setSearchParams, skillsKey]);

  useEffect(() => {
    void dispatch(fetchJobs());
  }, [dispatch, filters.search, filters.city, skillsKey, filters.page]);

  const changeCityTab = (value: string | null) => {
    if (!value || !(value in cityRoutes)) return;
    navigate(`/vacancies/${value}${location.search}`);
  };

  if (loading && items.length === 0) {
    return (
      <Container size="xl" style={{ paddingTop: 32 }}>
        <Center style={{ minHeight: 400 }}>
          <Loader size="xl" />
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" style={{ paddingTop: 32 }}>
        <Alert color="red" title="Ошибка">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <Group className={styles.topRow} wrap="nowrap">
          <Box className={styles.titleWrapper}>
            <Text className={styles.titleMain}>Список вакансий</Text>
            <Text className={styles.titleSub}>по профессии Frontend-разработчик</Text>
          </Box>
          <Group gap="xs" className={styles.searchGroup}>
            <TextInput
              placeholder="Поиск по названию или компании..."
              value={filters.search}
              onChange={(event) => dispatch(setSearch(event.currentTarget.value))}
              leftSection={<IconSearch size={16} />}
              className={styles.searchInput}
            />
            <Button variant="filled" color="blue">Найти</Button>
          </Group>
        </Group>

        <Tabs value={cityRoute} onChange={changeCityTab} variant="outline" mb="lg">
          <Tabs.List>
            <Tabs.Tab value="moscow">Москва</Tabs.Tab>
            <Tabs.Tab value="petersburg">Санкт-Петербург</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <Group className={styles.mainRow} align="flex-start">
          <Box className={styles.leftColumn}>
            <Filters
              skills={filters.skills}
              onAddSkill={(skill) => dispatch(addSkill(skill))}
              onRemoveSkill={(skill) => dispatch(removeSkill(skill))}
            />
          </Box>
          <Box className={styles.rightColumn}>
            {loading && (
              <Center mb="md">
                <Loader size="sm" />
              </Center>
            )}
            <Stack gap="md">
              {items.length > 0 ? (
                items.map((job) => <JobCard key={job.id} job={job} />)
              ) : (
                <Alert color="blue" title="Вакансии не найдены" variant="light">
                  Попробуйте изменить строку поиска или выбранные навыки.
                </Alert>
              )}
            </Stack>

            {pages > 0 && (
              <Center style={{ marginTop: 24 }}>
                <Pagination
                  total={pages}
                  value={filters.page}
                  onChange={(value) => dispatch(setPage(value))}
                />
              </Center>
            )}
          </Box>
        </Group>
    </Container>
  );
};

function App() {
  return (
    <MantineProvider theme={theme}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/vacancies/moscow" replace />} />
          <Route path="/vacancies">
            <Route index element={<CityVacanciesPage cityRoute="moscow" />} />
            <Route path="moscow" element={<CityVacanciesPage cityRoute="moscow" />} />
            <Route path="petersburg" element={<CityVacanciesPage cityRoute="petersburg" />} />
            <Route path=":id" element={<JobDetailsPage />} />
          </Route>
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </MantineProvider>
  );
}

export default App;
