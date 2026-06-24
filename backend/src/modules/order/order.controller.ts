import { NotFoundError, ValidationError } from "../../error-handler";
import prisma from "../../libs/prisma";
import redis from "../../libs/redis";
import { NextFunction, Request, Response } from "express";
import crypto from "crypto";



/**
 * Agency updates their side of the application status
 */
export const updateAgencyStatus = async (req: any, res: Response) => {
  try {
    const { applicationId, status } = req.body; // status = "INSPECTION_APPROVED" | "APPROVED" | "REJECTED"

    const application = await prisma.propertyApplications.findUnique({
      where: { id: applicationId, agencyId: req?.agent?.agency?.id },
    });

    if (!application)
      return res.status(404).json({ error: "Application not found" });

    const updated = await prisma.propertyApplications.update({
      where: { id: applicationId },
      data: { agencyStatus: status },
    });

    // update overall status if both sides approved
    if (
      updated.userStatus === "APPROVED" &&
      (status === "APPROVED" || status === "INSPECTION_APPROVED")
    ) {
      await prisma.propertyApplications.update({
        where: { id: applicationId },
        data: { overallStatus: "APPROVED" },
      });
    }

    if (status === "REJECTED") {
      await prisma.propertyApplications.update({
        where: { id: applicationId },
        data: { overallStatus: "REJECTED" },
      });
    }

    return res.status(200).json({
      message: "Agency status updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update agency status" });
  }
};

/**
 * User updates their side of the application status
 */
export const updateUserStatus = async (req: any, res: Response) => {
  try {
    const { applicationId, status } = req.body; // status = "APPROVED" | "REJECTED"

    const application = await prisma.propertyApplications.findUnique({
      where: { id: applicationId, userId: req?.user?.id },
    });

    if (!application)
      return res.status(404).json({ error: "Application not found" });

    const updated = await prisma.propertyApplications.update({
      where: { id: applicationId },
      data: { userStatus: status },
    });

    // update overall status if both approved
    if (
      status === "APPROVED" &&
      (updated.agencyStatus === "APPROVED" ||
        updated.agencyStatus === "INSPECTION_APPROVED")
    ) {
      await prisma.propertyApplications.update({
        where: { id: applicationId },
        data: { overallStatus: "APPROVED" },
      });
    }

    if (status === "REJECTED") {
      await prisma.propertyApplications.update({
        where: { id: applicationId },
        data: { overallStatus: "REJECTED" },
      });
    }

    return res.status(200).json({
      message: "User status updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update user status" });
  }
};

/**
 * User completes payment (rent/purchase)
 */
export const completePayment = async (req: Request, res: Response) => {
  try {
    const { applicationId, type, amount, paymentRef } = req.body;
    // type = "rent" | "purchase"

    const application = await prisma.propertyApplications.findUnique({
      where: { id: applicationId },
    });

    if (!application)
      return res.status(404).json({ error: "Application not found" });

    if (application.overallStatus !== "APPROVED") {
      return res
        .status(400)
        .json({ error: "Application not fully approved yet" });
    }

    let transaction;

    if (type === "rent") {
      transaction = await prisma.propertyRents.create({
        data: {
          userId: application.userId,
          propertyId: application.propertyId,
          agencyId: application.agencyId!,
          rentAmount: amount,
          paymentRef,
          startDate: new Date(),
          status: "COMPLETED",
        },
      });

      await prisma.propertyAnalytics.upsert({
        where: { propertyId: application.propertyId },
        update: { rents: { increment: 1 } },
        create: {
          propertyId: application.propertyId,
          agencyId: application.agencyId!,
          rents: 1,
          views: 0,
          saved: 0,
          applications: 0,
          inquiries: 0,
          sales: 0,
          lastViewedAt: new Date(),
        },
      });
      // sendLog({
      //   type: "success",
      //   message: `New property rent: ${transaction?.id}`,
      //   source: "order-service",
      // });
    } else {
      transaction = await prisma.propertySales.create({
        data: {
          userId: application.userId,
          propertyId: application.propertyId,
          agencyId: application.agencyId!,
          amount,
          paymentRef,
          status: "COMPLETED",
        },
      });
      await prisma.propertyAnalytics.upsert({
        where: { propertyId: application.propertyId },
        update: { sales: { increment: 1 } },
        create: {
          propertyId: application.propertyId,
          agencyId: application.agencyId!,
          sales: 1,
          views: 0,
          saved: 0,
          applications: 0,
          inquiries: 0,
          rents: 0,
          lastViewedAt: new Date(),
        },
      });
      // sendLog({
      //   type: "success",
      //   message: `New property sale: ${transaction?.id}`,
      //   source: "order-service",
      // });
    }

    await prisma.propertyApplications.update({
      where: { id: applicationId },
      data: { overallStatus: "COMPLETED" },
    });

    return res.status(200).json({
      message: "Payment successful",
      data: transaction,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Payment failed" });
  }
};

/**
 * 4️⃣ Get all user transactions
 */
export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const [rents, purchases] = await Promise.all([
      prisma.propertyRents.findMany({ where: { userId } }),
      prisma.propertySales.findMany({ where: { userId } }),
    ]);

    return res.status(200).json({
      message: "Fetched user transactions successfully.",
      data: { rents, purchases },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
};


// // create payment intent
// export const createPaymentIntent = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { amount, agentStripeAccountId, sessionId } = req.body;

//   const customerAmount = Math.round(amount * 100);
//   const platformFee = Math.floor(customerAmount * 0.1);

//   console.log(agentStripeAccountId);

//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: customerAmount,
//       currency: "usd",
//       payment_method_types: ["card"],
//       application_fee_amount: platformFee,
//       transfer_data: {
//         destination: agentStripeAccountId,
//       },
//       metadata: {
//         sessionId,
//         userId: req.user.id,
//       },
//     });
//     res.send({
//       clientSecret: paymentIntent.client_secret,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // create payment session
// export const createPaymentSession = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { cart, selectedAddressId, coupon } = req.body;
//     const userId = req.user.id;

//     if (!cart || !Array.isArray(cart) || cart.length === 0) {
//       return next(new ValidationError("Cart is empty or invalid."));
//     }

//     const normalizedCart = JSON.stringify(
//       cart
//         .map((item: any) => ({
//           id: item.id,
//           quantity: item.quantity,
//           sale_price: item.sale_price,
//           agencyId: item.agencyId,
//           selectedOptions: item.selectedOptions || {},
//         }))
//         .sort((a, b) => a.id.localCompare(b.id))
//     );

//     const keys = await redis.keys("payment-session:*");
//     for (const key of keys) {
//       const data = await redis.get(key);
//       if (data) {
//         const session = JSON.parse(data);
//         if (session.userId === userId) {
//           const existingCart = JSON.stringify(
//             session.cart
//               .map((item: any) => ({
//                 id: item.id,
//                 quantity: item.quantity,
//                 sale_price: item.sale_price,
//                 agencyId: item.agencyId,
//                 selectedOptions: item.selectedOptions || {},
//               }))
//               .sort((a: any, b: any) => a.id.localeCompare(b.id))
//           );

//           if (existingCart === normalizedCart) {
//             return res.status(200).json({ sessionId: key.split(":")[1] });
//           } else {
//             await redis.del(key);
//           }
//         }
//       }
//     }

//     // fetch agents and their stripe accounts
//     const uniqueAgencyIds = [
//       ...new Set(cart.map((item: any) => item.agencyId)),
//     ];

//     const agencies = await prisma.agencies.findMany({
//       where: {
//         id: { in: uniqueAgencyIds },
//       },
//       select: {
//         id: true,
//         agentId: true,
//         agent: {
//           select: {
//             stripeId: true,
//           },
//         },
//       },
//     });

//     const agentData = agencies.map((agency) => ({
//       agencyId: agency.id,
//       agentId: agency.agentId,
//       stripeAccountOd: agency?.agent?.stripeId,
//     }));

//     // calculate total
//     const totalAmount = cart.reduce((total: number, item: any) => {
//       return total + item.quantity * item.sale_price;
//     }, 0);

//     // create session payload
//     const sessionId = crypto.randomUUID();

//     const sessionData = {
//       userId,
//       cart,
//       agents: agentData,
//       totalAmount,
//       shippingAddressId: selectedAddressId || null,
//       coupon: coupon || null,
//     };

//     await redis.setex(
//       `payment-session:${sessionId}`,
//       600, //10 minutes
//       JSON.stringify(sessionData)
//     );

//     return res.status(201).json({ sessionId });
//   } catch (error) {
//     next(error);
//   }
// };

// // verifying payment session
// export const verifyingPaymentSession = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const sessionId = req.query.sessionId as string;
//     if (!sessionId) {
//       return res.status(400).json({ error: "Session ID is required." });
//     }

//     // Fetch session from Redis
//     const sessionKey = `payment-session:${sessionId}`;
//     const sessionData = await redis.get(sessionKey);

//     if (!sessionData) {
//       return res.status(404).json({ error: "Session not found or expired." });
//     }

//     // Parse and return session
//     const session = JSON.parse(sessionData);

//     return res.status(200).json({
//       success: true,
//       session,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // create order
// export const createOrder = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const stripeSignature = req.headers["stripe-signature"];
//     if (!stripeSignature) {
//       return res.status(400).send("Missing Stripe signature");
//     }

//     const rawBody = (req as any).rawBody;

//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(
//         rawBody,
//         stripeSignature,
//         process.env.STRIPE_WEBHOOK_SECRET!
//       );
//     } catch (err: any) {
//       console.error("Webhook signature verification failed.", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === "payment_intent.succeeded") {
//       const paymentIntent = event.data.object as Stripe.PaymentIntent;
//       const sessionId = paymentIntent.metadata.sessionId;
//       const userId = paymentIntent.metadata.userId;

//       const sessionKey = `payment-session:${sessionId}`;
//       const sessionData = await redis.get(sessionKey);

//       if (!sessionData) {
//         console.warn("Session data expired or missing for", sessionId);
//         return res
//           .status(200)
//           .send("No session found, skipping order creation");
//       }

//       const { cart, totalAmount, shippingAddressId, coupon } =
//         JSON.parse(sessionData);

//       const user = await prisma.users.findUnique({ where: { id: userId } });
//       const name = user?.name!;
//       const email = user?.email!;

//       const agencyGrouped = cart.reduce((acc: any, item: any) => {
//         if (!acc[item.agencyId]) acc[item.agencyId] = [];
//         acc[item.agencyId].push(item);
//         return acc;
//       }, {});

//       for (const agencyId in agencyGrouped) {
//         const orderItems = agencyGrouped[agencyId];

//         let orderTotal = orderItems.reduce(
//           (sum: number, p: any) => sum + p.quantity * p.sale_price,
//           0
//         );
//         // Apply discount if applicable
//         if (
//           coupon &&
//           coupon.discountedPropertyId &&
//           orderItems.some(
//             (item: any) => item.id === coupon.discountedPropertyId
//           )
//         ) {
//           const discountedItem = orderItems.find(
//             (item: any) => item.id === coupon.discountedPropertyId
//           );
//           if (discountedItem) {
//             const discount =
//               coupon.discountPercent > 0
//                 ? (discountedItem.sale_price *
//                     discountedItem.quantity *
//                     coupon.discountPercent) /
//                   100
//                 : coupon.discountAmount;

//             orderTotal -= discount;
//           }
//         }

//         // Create order
//         const order = await prisma.propertySales.create({
//           data: {
//             userId,
//             agencyId,
//             total: orderTotal,
//             status: "Paid",
//             shippingAddressId: shippingAddressId || null,
//             couponCode: coupon?.code || null,
//             discountAmount: coupon?.discountAmount || 0,
//             items: {
//               create: orderItems.map((item: any) => ({
//                 propertyId: item.id,
//                 quantity: item.quantity,
//                 price: item.sale_price,
//                 selectedOptions: item.selectedOptions,
//               })),
//             },
//           },
//         });

//         // Update property & analytics
//         for (const item of orderItems) {
//           const { id: propertyId, quantity } = item;

//           await prisma.properties.update({
//             where: { id: propertyId },
//             data: {
//               // stock: { decrement: quantity },
//               totalSales: { increment: quantity },
//             },
//           });

//           await prisma.propertyAnalytics.upsert({
//             where: { propertyId },
//             create: {
//               propertyId,
//               agencyId,
//               sales: quantity,
//               lastViewedAt: new Date(),
//             },
//             update: {
//               sales: { increment: quantity },
//             },
//           });

//           const existingAnalytics = await prisma.userAnalytics.findUnique({
//             where: { userId },
//           });

//           const newAction = {
//             propertyId,
//             agencyId,
//             action: "purchase",
//             timestamp: Date.now(),
//           };

//           const currentActions = Array.isArray(existingAnalytics?.actions)
//             ? (existingAnalytics.actions as Prisma.JsonArray)
//             : [];

//           if (existingAnalytics) {
//             await prisma.userAnalytics.update({
//               where: { userId },
//               data: {
//                 lastVisited: new Date(),
//                 actions: [...currentActions, newAction],
//               },
//             });
//           } else {
//             await prisma.userAnalytics.create({
//               data: {
//                 userId,
//                 lastVisited: new Date(),
//                 actions: [newAction],
//               },
//             });
//           }
//         }

//         // Send email for user
//         await sendEmail(
//           email,
//           "🛍️ Your Teepas Order Confirmation",
//           "order-confirmation",
//           {
//             name,
//             cart,
//             totalAmount: coupon?.discountAmount
//               ? totalAmount - coupon?.discountAmount
//               : totalAmount,
//             trackingUrl: `/order/${order.id}`,
//           }
//         );

//         // Create notifications for agents
//         const createdAgencyIds = Object.keys(agencyGrouped);
//         const agentAgencies = await prisma.agencies.findMany({
//           where: { id: { in: createdAgencyIds } },
//           select: {
//             id: true,
//             agentId: true,
//             name: true,
//           },
//         });

//         for (const agency of agentAgencies) {
//           const firstProperty = agencyGrouped[agency.id][0];
//           const propertyTitle = firstProperty?.title || "new item";

//           await prisma.notifications.create({
//             data: {
//               title: "🛒 New Order Received",
//               message: `A customer just ordered ${propertyTitle} from your agency.`,
//               creatorId: userId,
//               receiverId: agency.agentId,
//               redirect_link: `https://teepas.com/order/${sessionId}`,
//             },
//           });
//         }

//         // Create notification for admin
//         await prisma.notifications.create({
//           data: {
//             title: "📦 Platform Order Alert",
//             message: `A new order was placed by ${name}.`,
//             creatorId: userId,
//             receiverId: "admin",
//             redirect_link: `https://teepas.com/order/${sessionId}`,
//           },
//         });

//         await redis.del(sessionKey);
//       }
//     }
//     res.status(200).json({ received: true });
//   } catch (error) {
//     console.log(error);
//     return next(error);
//   }
// };

// // get agents orders
// export const getAgentOrders = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const agency = await prisma.agencies.findUnique({
//       where: {
//         agentId: req.agent.id,
//       },
//     });

//     // fetch all orders for this agency
//     const orders = await prisma.propertySales.findMany({
//       where: {
//         agencyId: agency?.id,
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             avatar: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     res.status(201).json({
//       success: true,
//       orders,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // get order details
// export const getOrderDetails = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     console.log("ffff");
//     const orderId = req.params.id;

//     const order = await prisma.propertySales.findUnique({
//       where: {
//         id: orderId,
//       },
//       include: {
//         items: true,
//       },
//     });

//     if (!order) {
//       return next(new NotFoundError("Order not found with the id!"));
//     }

//     const shippingAddress = order.shippingAddressId
//       ? await prisma.address.findUnique({
//           where: {
//             id: order?.shippingAddressId,
//           },
//         })
//       : null;

//     const coupon = order.couponCode
//       ? await prisma?.promotions.findUnique({
//           where: {
//             discountCode: order.couponCode,
//           },
//         })
//       : null;

//     // fetch all properties details in one go
//     const propertyIds = order.items.map((item) => item.propertyId);

//     const properties = await prisma.properties.findMany({
//       where: {
//         id: { in: propertyIds },
//       },
//       select: {
//         id: true,
//         title: true,
//         images: true,
//       },
//     });

//     const propertyMap = new Map(properties.map((p) => [p.id, p]));

//     const items = order.items.map((item) => ({
//       ...item,
//       selectedOptions: item.selectedOptions,
//       property: propertyMap.get(item.propertyId) || null,
//     }));

//     res.status(200).json({
//       success: true,
//       order: {
//         ...order,
//         items,
//         shippingAddress,
//         couponCode: coupon,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // update order status
// export const updateDeliveryStatus = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { orderId } = req.params;
//     const { deliveryStatus } = req.body;

//     if (!orderId || !deliveryStatus) {
//       return res
//         .status(400)
//         .json({ error: "Missing order ID or delivery status." });
//     }

//     const allowedStatuses = [
//       "Ordered",
//       "Packed",
//       "Shipped",
//       "Out for Delivery",
//       "Delivered",
//     ];
//     if (!allowedStatuses.includes(deliveryStatus)) {
//       return next(new ValidationError("Invalid delivery status."));
//     }

//     const existingOrder = await prisma.propertySales.findUnique({
//       where: { id: orderId },
//     });

//     if (!existingOrder) {
//       return next(new NotFoundError("Order not found!"));
//     }

//     const updatedOrder = await prisma.propertySales.update({
//       where: { id: orderId },
//       data: {
//         deliveryStatus,
//         updatedAt: new Date(),
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Delivery status updated successfully.",
//       order: updatedOrder,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // verify coupon code
// export const verifyCouponCode = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { couponCode, cart } = req.body;

//     if (!couponCode || !cart || cart.length === 0) {
//       return next(new ValidationError("Coupon code and cart are required!"));
//     }

//     // Fetch the discount code
//     const discount = await prisma.promotions.findUnique({
//       where: { discountCode: couponCode },
//     });

//     if (!discount) {
//       return next(new ValidationError("Coupon code isn't valid!"));
//     }

//     // Find matching property that includes this discount code
//     const matchingProperty = cart.find((item: any) =>
//       item.promotions?.some((d: any) => d === discount.id)
//     );

//     if (!matchingProperty) {
//       return res.status(200).json({
//         valid: false,
//         discount: 0,
//         discountAmount: 0,
//         message: "No matching property found in cart for this coupon",
//       });
//     }

//     let discountAmount = 0;
//     const price = matchingProperty.sale_price * matchingProperty.quantity;

//     if (discount.discountType === "percentage") {
//       discountAmount = (price * discount.discountValue) / 100;
//     } else if (discount.discountType === "flat") {
//       discountAmount = discount.discountValue;
//     }

//     // Prevent discount from being greater than total price
//     discountAmount = Math.min(discountAmount, price);

//     res.status(200).json({
//       valid: true,
//       discount: discount.discountValue,
//       discountAmount: discountAmount.toFixed(2),
//       discountedPropertyId: matchingProperty.id,
//       discountType: discount.discountType,
//       message: "Discount applied to 1 eligible property",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // get user orders
// export const getUserOrders = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const orders = await prisma.propertySales.findMany({
//       where: {
//         userId: req.user.id,
//       },
//       include: {
//         items: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     res.status(201).json({
//       success: true,
//       orders,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // get admin orders
// export const getAdminOrders = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // Fetch all orders
//     const orders = await prisma.propertySales.findMany({
//       include: {
//         user: true,
//         agency: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });
//     res.status(200).json({
//       success: true,
//       orders,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
