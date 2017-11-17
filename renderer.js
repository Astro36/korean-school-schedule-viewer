const $ = require('jquery')
const school = require('korean-school')

const tabInstance = new M.Tabs(document.querySelector('.tabs'), {
  onShow (element) {
    console.log($(element).attr('id'))
  }
})

function updateScheduleViewer (which) {
  school.getSchedules(school.find('경기도', '백석고'), 1, 1, (schedules) => {
    if (schedules !== null) {
      const $viewer = $('#weekly-schedule-viewer')
      $viewer.empty()
      for (let i = 0; i < 8; i += 1) {
        let buf = '<tr>'
        for (let j = 1; j < 6; j += 1) {
          const value = schedules[j][i]
          buf += `<td ${value && value.isChanged ? 'class="blue-text"' : ''}>${value ? `${value.subject} (${value.teacher})` : '없음'}</td>`
        }
        buf += '</tr>'
        $viewer.append(buf)
      }
      M.toast({html: '시간표가 업데이트 되었습니다.'})
    } else {
      M.toast({html: '시간표를 불러올 수 없습니다. 인터넷 상태를 확인해주세요.'})
    }
  })
}

$(document).ready(() => {
  $('#update').click((element) => {
    updateScheduleViewer()
  })
})
