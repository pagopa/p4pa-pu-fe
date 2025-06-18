type FilterValues = Record<string, unknown>;

/**
* Checks if ad object filters contains non empty filters
 * @param filters - Object with filters
 * @returns true if there is at least one filter filled
 */
export const noFilterSetted = (filters: FilterValues) => {
    const listEntries = Object.values(filters);
    return (
      !Array.isArray(listEntries) || 
      listEntries.length === 0 || 
      listEntries.every(el => typeof el === 'string' ? el.trim() === '' : !el)
    );
    };

export default { noFilterSetted };