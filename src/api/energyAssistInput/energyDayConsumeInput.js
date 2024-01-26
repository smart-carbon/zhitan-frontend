import request from '@/utils/request'
// 查询能耗手动输入信息
export function selectConsumeInputList(query) {
  return request({
    url: '/energyAssistInput/energyDayConsumeInput/listEnergyConsumeInputIndex',
    method: 'get',
    params: query
  })
}

// 保存能耗手动输入信息
export function saveConsumeInput(data) {
  return request({
    url: '/energyAssistInput/energyDayConsumeInput/saveEnergyConsumeInput',
    method: 'post',
    data: data
  })
}
