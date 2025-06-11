/**
 * Attend que la fonction async `fetchFn` retourne une valeur qui satisfait le prédicat `predicate`.
 * Réessaie toutes les `intervalMs` millisecondes, jusqu'à `maxTries` fois.
 *
 * @param fetchFn Fonction asynchrone qui retourne la valeur à tester (ex: refetch)
 * @param predicate Fonction qui teste si la valeur retournée est celle attendue
 * @param options Options de configuration (intervalMs, maxTries)
 * @returns La valeur retournée par fetchFn quand predicate est vrai, ou undefined si timeout
 */
export async function waitForValue<T>(
  fetchFn: () => Promise<T>,
  predicate: (value: T) => boolean,
  options?: { intervalMs?: number; maxTries?: number }
): Promise<T | undefined> {
  const intervalMs = options?.intervalMs ?? 1000;
  const maxTries = options?.maxTries ?? 5;
  let tries = 0;
  let value: T | undefined = undefined;

  while (tries < maxTries) {
    value = await fetchFn();
    if (predicate(value)) {
      return value;
    }
    await new Promise((res) => setTimeout(res, intervalMs));
    tries++;
  }
  return undefined;
}
