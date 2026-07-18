import testCaseData from '../data/testcases.json';

export const TC_MODULES = testCaseData.modules;

export function getAllTestCases() {
  const cases = [];
  TC_MODULES.forEach((mod) => {
    mod.categories.forEach((cat) => {
      cat.testCases.forEach((tc) => {
        cases.push({ ...tc, moduleId: mod.id, moduleName: mod.name, categoryName: cat.name });
      });
    });
  });
  return cases;
}

export const PRIORITIES = ['High', 'Medium', 'Low'];
export const TYPES = ['Positive', 'Negative', 'Edge'];
