<template>
  <div>
    <basic-container>
      <el-form
        :model="queryParams"
        ref="queryForm"
        label-width="72px"
        class="special-form"
      >
        <el-row :gutter="24">
          <el-col :span="6">
            <el-form-item label="参数编码" prop="code">
              <el-input
                v-model="queryParams.code"
                placeholder="请输入参数编码"
                clearable
                size="small"
                @keyup.enter.native="handleQuery"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="参数名称" prop="name">
              <el-input
                v-model="queryParams.name"
                placeholder="请输入参数名称"
                clearable
                size="small"
                @keyup.enter.native="handleQuery"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="设备类型" prop="deviceType">
              <el-select
                v-model="queryParams.deviceType"
                placeholder="请选择设备类型"
                clearable
                size="small"
                style="width: 100%"
              >
                <el-option
                  v-for="dict in deviceTypeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item class="operation">
              <el-button
                type="primary"
                icon="el-icon-search"
                size="mini"
                @click="handleQuery"
                >搜索</el-button
              >
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </basic-container>
    <basic-container style="margin-top: 16px" :bodyStyle="bodyStyle">
      <el-row :gutter="10" class="mb8" style="margin-bottom: 19px">
        <el-col :span="1.5">
          <el-button
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['basicsetting:template:add']"
            >新增
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="success"
            icon="el-icon-edit"
            size="mini"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['basicsetting:template:edit']"
            >修改
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['basicsetting:template:remove']"
            >删除
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
            v-hasPermi="['basicsetting:template:export']"
            >导出
          </el-button>
        </el-col>
      </el-row>
      <el-table
        :height="height"
        v-loading="loading"
        :data="templateList"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="参数编码" align="center" prop="code" />
        <el-table-column label="参数名称" align="center" prop="name" />
        <el-table-column
          label="单位"
          align="center"
          prop="unit"
          :formatter="unitFormat"
        />
        <el-table-column
          label="设备类型"
          align="center"
          prop="deviceType"
          :formatter="deviceTypeFormat"
        />
        <el-table-column
          label="操作"
          width="150"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['basicsetting:template:edit']"
              >修改
            </el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['basicsetting:template:remove']"
              >删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </basic-container>
    <!-- 添加或修改采集参数模板对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入参数编码" />
        </el-form-item>
        <el-form-item label="参数名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-select v-model="form.unit" placeholder="请选择单位" filterable>
            <el-option
              v-for="dict in unitOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceType">
          <el-select v-model="form.deviceType" placeholder="请选择设备类型">
            <el-option
              v-for="dict in deviceTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listTemplate,
  getTemplate,
  delTemplate,
  addTemplate,
  updateTemplate,
  exportTemplate
} from "@/api/basicsetting/template";
import mixins from "@/layout/mixin/getHeight";

export default {
  mixins: [mixins],
  data() {
    return {
      height: null,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 选中的项编码
      codes: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 采集参数模板表格数据
      templateList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 参数所属类型字典
      deviceTypeOptions: [],
      unitOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        deviceType: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        code: [
          { required: true, message: "请输参数编码", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "blur"
          },
          {
            pattern: /^[a-zA-Z][A-Za-z0-9]+$/,
            message: "必须为数字或字母，且首字符只能为字母"
          }
        ],
        name: [
          { required: true, message: "请输参数名称", trigger: "blur" },
          { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" }
        ],
        deviceType: [
          { required: true, message: "请选择设备类型", trigger: "blur" }
        ]
      },
      dictDefaultVal: undefined
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_unit").then(response => {
      this.unitOptions = response.data;
    });
    this.getDicts("sys_device_type").then(response => {
      this.deviceTypeOptions = response.data;
      this.dictDefaultVal = this.deviceTypeOptions.find(
        f => f.isDefault === "Y"
      );
    });
  },
  methods: {
    setCharts() {
      this.bodyStyle = {
        height: window.innerHeight - 210 + "px",
        overflow: "hidden"
      };
      this.height = window.innerHeight - 370;
    },
    /** 查询采集参数模板列表 */
    getList() {
      this.loading = true;
      listTemplate(this.queryParams).then(response => {
        this.templateList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 参数所属类型字典翻译
    deviceTypeFormat(row, column) {
      return this.selectDictLabel(this.deviceTypeOptions, row.deviceType);
    },
    unitFormat(row, column) {
      return this.selectDictLabel(this.unitOptions, row.unit);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        code: undefined,
        name: undefined,
        deviceType: undefined,
        unit: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.codes = selection.map(item => item.code);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      if (this.dictDefaultVal) {
        this.form.deviceType = this.dictDefaultVal.dictValue;
      }
      this.open = true;
      this.title = "添加采集参数模板";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getTemplate(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改采集参数模板";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateTemplate(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addTemplate(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      const codes = row.code || this.codes;
      this.$confirm(
        '是否确认删除采集参数模板编号为"' + codes + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(function() {
          return delTemplate(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有采集参数模板数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(function() {
          return exportTemplate(queryParams);
        })
        .then(response => {
          this.download(response.msg);
        })
        .catch(function() {});
    }
  }
};
</script>
<style scoped lang="scss">
.special-form {
  @import "~@/assets/styles/common-table-form.scss";
}
</style>
