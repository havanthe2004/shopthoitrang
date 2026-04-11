import fs from 'fs';
import path from 'path';
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Product } from "../models/Product";
import { ProductColor } from "../models/ProductColor";
import { ProductVariant } from "../models/ProductVariant";
import { ProductImage } from "../models/ProductImage";
import { AdminLog } from "../models/AdminLog";
import { OrderItem } from "../models/OrderItem";

export class AdminProductController {

  
  private static async logAction(adminId: number, action: string) {
    const logRepo = AppDataSource.getRepository(AdminLog);
    await logRepo.save(logRepo.create({ admin: { adminId }, action }));
  }

  static async getProducts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const categoryId = req.query.categoryId;

      const isActiveParam = req.query.isActive;
      const isActive = isActiveParam === 'false' ? false : true;

      const skip = (page - 1) * limit;
      const productRepo = AppDataSource.getRepository(Product);

      const qb = productRepo.createQueryBuilder("product")
        .select("product.productId", "productId")
        .where("product.name LIKE :search", { search: `%${search}%` })
        .andWhere("product.isActive = :isActive", { isActive });

      if (categoryId) {
        qb.andWhere("product.categoryId = :categoryId", { categoryId: Number(categoryId) });
      }

      const total = await qb.getCount();
      const idsRaw = await qb.orderBy("product.productId", "DESC").skip(skip).take(limit).getRawMany();
      const ids = idsRaw.map(i => i.productId);

      if (ids.length === 0) {
        return res.json({ items: [], meta: { totalItems: 0, totalPages: 0, currentPage: page } });
      }

      const products = await productRepo.createQueryBuilder("product")
        .leftJoinAndSelect("product.category", "category")
        .leftJoinAndSelect("product.colors", "color")
        .leftJoinAndSelect("color.images", "image")
        .leftJoinAndSelect("product.variants", "variant")
        .whereInIds(ids)
        .orderBy("product.productId", "DESC")
        .getMany();

      return res.json({
        items: products,
        meta: {
          totalItems: total,
          itemCount: products.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm" });
    }
  }
 
  static async getDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await AppDataSource.getRepository(Product).findOne({
        where: { productId: Number(id) },
        relations: ["category", "colors", "colors.images", "variants", "variants.color"],
      });

      if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

      const orderItemRepo = AppDataSource.getRepository(OrderItem);

      
      const variantsWithInfo = await Promise.all(product.variants.map(async (v) => {
        const count = await orderItemRepo.count({ where: { variant: { productVariantId: v.productVariantId } } });
        return { ...v, hasOrders: count > 0 };
      }));

      (product as any).variants = variantsWithInfo;
      return res.json(product);
    } catch (err) {
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy chi tiết" });
    }
  }


  static async createProduct(req: Request, res: Response) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!req.body.data) throw new Error("Thiếu dữ liệu!");
      const { productData, colorsData } = JSON.parse(req.body.data);
      const files = req.files as Express.Multer.File[];
      const adminId = (req as any).admin.adminId;

      // 1. Lưu Product
      const savedProduct = await queryRunner.manager.save(Product, {
        ...productData,
        category: { categoryId: productData.categoryId },
        isActive: true
      });

  
      for (const colorItem of colorsData) {
        const savedColor = await queryRunner.manager.save(ProductColor, {
          color: colorItem.color,
          hexCode: colorItem.hexCode,
          product: savedProduct,
        });

        for (const v of colorItem.variants) {
          await queryRunner.manager.save(ProductVariant, {
            ...v,
            product: savedProduct,
            color: savedColor,
            isActive: true
          });
        }

        for (const idx of colorItem.imageIndices) {
          await queryRunner.manager.save(ProductImage, {
            url: `uploads/products/${files[idx].filename}`,
            color: savedColor,
          });
        }
      }

      await AdminProductController.logAction(adminId, `Tạo sản phẩm mới: ${savedProduct.name}`);
      await queryRunner.commitTransaction();
      return res.status(201).json({ message: "Thêm sản phẩm thành công", productId: savedProduct.productId });

    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      return res.status(400).json({ message: err.message });
    } finally {
      await queryRunner.release();
    }
  }

 
  static async updateProduct(req: Request, res: Response) {
    const { id } = req.params;
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!req.body.data) throw new Error("Dữ liệu không hợp lệ!");
      const { productData, colorsData } = JSON.parse(req.body.data);
      const files = req.files as Express.Multer.File[];
      const adminId = (req as any).admin.adminId;

      const productRepo = queryRunner.manager.getRepository(Product);
      const colorRepo = queryRunner.manager.getRepository(ProductColor);
      const variantRepo = queryRunner.manager.getRepository(ProductVariant);
      const imageRepo = queryRunner.manager.getRepository(ProductImage);
      const orderItemRepo = queryRunner.manager.getRepository(OrderItem);

      
      const product = await productRepo.findOne({ where: { productId: Number(id) } });
      if (!product) throw new Error("Sản phẩm không tồn tại");

      Object.assign(product, productData);
      if (productData.categoryId) product.category = { categoryId: Number(productData.categoryId) } as any;
      await productRepo.save(product);

      for (const colorItem of colorsData) {
        let colorEntity: ProductColor;

        if (colorItem.productColorId) {
          
          colorEntity = await colorRepo.findOneOrFail({ where: { productColorId: colorItem.productColorId } });
          colorEntity.color = colorItem.color;
          colorEntity.hexCode = colorItem.hexCode;
          colorEntity.isActive = colorItem.isActive ?? true; 
          await colorRepo.save(colorEntity);

         
          const dbImages = await imageRepo.find({ where: { color: { productColorId: colorEntity.productColorId } } });
          const remainingImageIds = (colorItem.oldImages || []).map((img: any) => img.productImageId);

          for (const dbImg of dbImages) {
            if (!remainingImageIds.includes(dbImg.productImageId)) {
              
              const filePath = path.join(__dirname, '../../', dbImg.url);
              if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
             
              await imageRepo.remove(dbImg);
            }
          }
        } else {
          
          colorEntity = await colorRepo.save(colorRepo.create({
            color: colorItem.color,
            hexCode: colorItem.hexCode,
            product: product,
            isActive: true
          }));
        }

        if (colorItem.newImageIndices && colorItem.newImageIndices.length > 0) {
          for (const idx of colorItem.newImageIndices) {
            if (files[idx]) {
              await imageRepo.save(imageRepo.create({
                url: `uploads/products/${files[idx].filename}`,
                color: colorEntity
              }));
            }
          }
        }

     
        if (colorItem.variants) {
          for (const v of colorItem.variants) {
            if (v.productVariantId) {
            
              const hasOrders = await orderItemRepo.count({
                where: { variant: { productVariantId: v.productVariantId } }
              });

              if (hasOrders > 0) {
               
                await variantRepo.update(v.productVariantId, {
                  price: v.price,
                  stock: v.stock,
                  isActive: v.isActive
                });
              } else {
                
                await variantRepo.save(v);
              }
            } else {
            
              await variantRepo.save(variantRepo.create({
                ...v,
                product: product,
                color: colorEntity,
                isActive: true
              }));
            }
          }
        }
      }

      await AdminProductController.logAction(adminId, `Cập nhật sản phẩm: ${product.name} (ID: ${id})`);
      await queryRunner.commitTransaction();
      return res.json({ success: true, message: "Cập nhật sản phẩm thành công" });

    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      console.error("UPDATE PRODUCT ERROR:", err);
      return res.status(400).json({ message: err.message });
    } finally {
      await queryRunner.release();
    }
  }

 
  static async toggleProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const adminId = (req as any).admin.adminId;
      const repo = AppDataSource.getRepository(Product);

      const product = await repo.findOneBy({ productId: Number(productId) });
      if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

      product.isActive = !product.isActive;
      await repo.save(product);

      await AdminProductController.logAction(adminId, `Đổi trạng thái sản phẩm ID=${productId} sang ${product.isActive}`);
      return res.json({ success: true, isActive: product.isActive });
    } catch (err) {
      return res.status(500).json({ message: "Lỗi khi đổi trạng thái" });
    }
  }

  static async restoreVariant(req: Request, res: Response) {
    try {
      const { variantId } = req.params;
      const adminId = (req as any).admin.adminId;
      const variantRepo = AppDataSource.getRepository(ProductVariant);

      const variant = await variantRepo.findOne({
        where: { productVariantId: Number(variantId) },
        relations: ["product"]
      });

      if (!variant) throw new Error("Biến thể không tồn tại");

      variant.isActive = true;
      await variantRepo.save(variant);

      await AdminProductController.logAction(adminId, `Khôi phục biến thể ID=${variantId}`);
      return res.json({ success: true, message: "Đã bật lại biến thể" });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  static async toggleVariant(req: Request, res: Response) {
    try {
      const { variantId } = req.params;
      const adminId = (req as any).admin.adminId;
      const variantRepo = AppDataSource.getRepository(ProductVariant);

      const variant = await variantRepo.findOneBy({ productVariantId: Number(variantId) });
      if (!variant) return res.status(404).json({ message: "Không tìm thấy biến thể" });

      variant.isActive = !variant.isActive;
      await variantRepo.save(variant);

      const action = `Đổi trạng thái biến thể ID=${variantId} sang ${variant.isActive}`;
      const logRepo = AppDataSource.getRepository(AdminLog);
      await logRepo.save(logRepo.create({ admin: { adminId }, action }));

      return res.json({ success: true, isActive: variant.isActive });
    } catch (err) {
      return res.status(500).json({ message: "Lỗi hệ thống khi toggle biến thể" });
    }
  }
}