import { NextFunction, Request, Response } from "express";
import { NotFoundError, ValidationError } from "../../error-handler";
import prisma from "../../libs/prisma";
import { markTaskCompleted } from "../../middleware/markTask";

/** AGENCY */
// create agency address
export const createAgencyAddress = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agentId = req.agent.id;
    const agencyId = req.agency.id;

    const { label, name, street, city, state, zip, country, isDefault } =
      req.body;

    if (!label || !name || !street || !city || !zip || !country || !state) {
      return next(new ValidationError("All fields are required!"));
    }

    const agency = await prisma.agencies.findUnique({
      where: { id: agencyId },
    });
    if (!agency) return next(new ValidationError("Agency not found!"));

    if (isDefault) {
      // Set all other addresses to false
      await prisma.agencyAddresses.updateMany({
        where: { agencyId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.agencyAddresses.create({
      data: {
        agencyId,
        label,
        name,
        street,
        city,
        zip,
        country,
        state,
        isDefault: isDefault ?? true,
      },
    });

    await markTaskCompleted({ agentId, agencyId }, "ADD_AGENCY_ADDRESS");

    res.status(201).json({
      success: true,
      address,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgencyAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { agencyId } = req.params;
    if (!agencyId) return next(new ValidationError("Agency ID is required!"));

    const addresses = await prisma.agencyAddresses.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgencyAddressById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const address = await prisma.agencyAddresses.findUnique({
      where: { id },
    });

    if (!address) return next(new ValidationError("Address not found!"));

    res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAgencyAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { label, name, street, state, city, zip, country, isDefault } =
      req.body;

    const existing = await prisma.agencyAddresses.findUnique({
      where: { id },
    });
    if (!existing) return next(new ValidationError("Address not found!"));

    if (isDefault) {
      await prisma.agencyAddresses.updateMany({
        where: { agencyId: existing.agencyId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.agencyAddresses.update({
      where: { id },
      data: {
        label,
        name,
        street,
        city,
        zip,
        state,
        country,
        isDefault: isDefault ?? existing.isDefault,
      },
    });

    res.status(200).json({
      success: true,
      address: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAgencyAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const existing = await prisma.agencyAddresses.findUnique({
      where: { id },
    });
    if (!existing) return next(new ValidationError("Address not found!"));

    await prisma.agencyAddresses.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// set default address
export const setDefaultAgencyAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const existing = await prisma.agencyAddresses.findUnique({
      where: { id },
    });
    if (!existing) return next(new ValidationError("Address not found!"));

    await prisma.agencyAddresses.updateMany({
      where: { agencyId: existing.agencyId },
      data: { isDefault: false },
    });

    const updated = await prisma.agencyAddresses.update({
      where: { id },
      data: { isDefault: true },
    });

    res.status(200).json({
      success: true,
      address: updated,
    });
  } catch (error) {
    next(error);
  }
};

/** USERS */
// add new address
export const addUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { label, name, street, city, zip, country, isDefault } = req.body;

    if (!label || !name || !street || !city || !zip || !country) {
      return next(new ValidationError("All fields are required"));
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label,
        name,
        street,
        city,
        zip,
        country,
        isDefault,
      },
    });

    res.status(201).json({
      success: true,
      address: newAddress,
    });
  } catch (error) {
    return next(error);
  }
};

// delete user address
export const deleteUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    if (!addressId) {
      return next(new ValidationError("Address ID is required"));
    }

    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!existingAddress) {
      return next(new NotFoundError("Address not found or unauthorized"));
    }

    await prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// get user addresses
export const getUserAddresses = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    const addresses = await prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};
