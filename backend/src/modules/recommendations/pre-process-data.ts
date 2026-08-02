export const preProcessData = (userActions: any, properties: any) => {
  const interactions: any = [];

  userActions.forEach((action: any) => {
    interactions.push({
      userId: action.userId,
      propertyId: action.propertyId,
      actionType: action.actionType,
    });
  });

  return { interactions, properties };
};
