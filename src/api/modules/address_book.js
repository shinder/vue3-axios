import request from "../index";

/**
 * 通訊錄相關 API
 */
export const addressBookApi = {
  /**
   * 取得通訊錄列表
   * @param {Object} params - 查詢參數
   * @param {number} params.page - 頁碼
   * @param {number} params.page_size - 每頁數量
   * @param {string} params.search - 搜尋關鍵字
   */

  getAddressBookList(params) {
    return request({
      url: "/address_book",
      method: "get",
      params,
    });
  },

  /**
   * 取得單一通訊錄
   * @param {number} id - 通訊錄 ID
   */
  getAddressBookById(id) {
    return request({
      url: `/address_book/${id}`,
      method: "get",
    });
  },

  /**
   * 建立通訊錄
   * @param {Object} data - 通訊錄資料
   */
  createAddressBookItem(data) {
    return request({
      url: "/address_book",
      method: "post",
      data,
    });
  },

  /**
   * 更新通訊錄
   * @param {number} id - 通訊錄 ID
   * @param {Object} data - 更新資料
   */
  updateAddressBookItem(id, data) {
    return request({
      url: `/address_book/${id}`,
      method: "put",
      data,
    });
  },


  /**
   * 刪除通訊錄
   * @param {number} id - 通訊錄 ID
   */
  deleteAddressBookItem(id) {
    return request({
      url: `/address_book/${id}`,
      method: "delete",
    });
  },

  /**
   * 上傳通訊錄頭像
   * @param {number} id - 通訊錄 ID
   * @param {File} file - 圖片檔案
   */
  uploadAvatar(id, file) {
    const formData = new FormData();
    formData.append("avatar", file);

    return request({
      url: `/api/address_book/${id}/avatar`,
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// 也可以導出單個函數
export const getAddressBookList = addressBookApi.getAddressBookList;
export const getAddressBookById = addressBookApi.getAddressBookById;
export const createAddressBookItem = addressBookApi.createAddressBookItem;
export const updateAddressBookItem = addressBookApi.updateAddressBookItem;
export const deleteAddressBookItem = addressBookApi.deleteAddressBookItem;
