export async function useViewTransition(callback) {
  const doTransition = async () => {
    try {
      await callback();
    } catch (error) {
      console.error('Error during transition:', error);
    }
  };

  if (document.startViewTransition) {
    await document.startViewTransition(doTransition);
  } else {
    await doTransition();
  }
}
