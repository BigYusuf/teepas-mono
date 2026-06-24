export const preProcessData = (userActions: any, properties: any) => {
  const interactions: any = [];

  userActions.forEach((action: any) => {
    interactions.push({
      userId: action.userId,
      productId: action.productId,
      actionType: action.actionType,
    });
  });

  return { interactions, properties };
};
