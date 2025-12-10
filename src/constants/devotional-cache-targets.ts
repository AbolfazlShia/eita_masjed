const buildDevotionalRoutes = () => {
  const routes: string[] = ["/devotions"];
  for (let day = 0; day < 7; day += 1) {
    routes.push(`/devotional?type=dua&day=${day}`);
    routes.push(`/devotional?type=ziyarat&day=${day}`);
  }
  return routes;
};

export const DEVOTIONAL_CACHE_ROUTES = buildDevotionalRoutes();
