window.Hammer = require('./node_modules/materialize-css/js/hammer.min.js')
require('materialize-css')

const school = require('korean-school')

let schoolName
let showingTab = 'for-student'

const updateScheduleViewer = async (which) => {
  const $viewer = $('#weekly-schedule-viewer')
  $viewer.empty()
  if (schoolName) {
    if (which === 'for-teacher') {
      let teacherData = $('select#teacher').val()
      if (teacherData) {
        const schedules = await school.getTeacherSchedules(school.find('', schoolName), teacherData)
        if (schedules !== null) {
          for (let i = 0; i < 8; i += 1) {
            let buf = '<tr>'
            for (let j = 1; j < 6; j += 1) {
              const value = schedules[j][i]
              buf += `<td class="${value && value.isChanged ? 'blue-text' : ''}${value ? ' tooltipped" data-tooltip="' + value.subjectOriginal : ''}">${value ? `${value.subject}<br>(${value.grade}학년 ${value.room}반)` : '없음'}</td>`
            }
            buf += '</tr>'
            $viewer.append(buf)
          }
          $('.tooltipped').tooltip({delay: 50})
          Materialize.toast('시간표가 업데이트 되었습니다.', 3000)
        } else {
          Materialize.toast('시간표를 불러올 수 없습니다. 인터넷 상태를 확인해주세요.', 3000)
        }
      } else {
        Materialize.toast('교사 정보를 입력해주세요.', 3000)
      }
    } else if (which === 'for-student') {
      let studentData = $('select#student').val()
      if (studentData) {
        studentData = studentData.split('|')
        const schedules = await school.getSchedules(school.find('', schoolName), Number(studentData[0]), Number(studentData[1]))
        if (schedules !== null) {
          for (let i = 0; i < 8; i += 1) {
            let buf = '<tr>'
            for (let j = 1; j < 6; j += 1) {
              const value = schedules[j][i]
              buf += `<td class="${value && value.isChanged ? 'blue-text' : ''}${value ? ' tooltipped" data-tooltip="' + value.subjectOriginal : ''}">${value ? `${value.subject} (${value.teacher})` : '없음'}</td>`
            }
            buf += '</tr>'
            $viewer.append(buf)
          }
          $('.tooltipped').tooltip({delay: 50})
          Materialize.toast('시간표가 업데이트 되었습니다.', 3000)
        } else {
          Materialize.toast('시간표를 불러올 수 없습니다. 인터넷 상태를 확인해주세요.', 3000)
        }
      } else {
        Materialize.toast('학생 정보를 입력해주세요.', 3000)
      }
    }
  } else {
    Materialize.toast('학교 정보를 입력해주세요.', 3000)
  }
}

const updateSchoolData = async (name) => {
  schoolName = name
  const $studentSelector = $('select#student')
  const $teacherSelector = $('select#teacher')
  const comciganData = await school.getComciganData(school.find('', schoolName))
  if (comciganData) {
    $studentSelector.empty()
    $studentSelector.append('<option value="" disabled selected>1학년</option>')
    for (let i = 1; i <= Number(comciganData.학급수[1]); i += 1) {
      $studentSelector.append('<option value="1|' + i + '">1학년 ' + i + '반</option>')
    }
    $studentSelector.append('<option value="" disabled>2학년</option>')
    for (let i = 1; i <= Number(comciganData.학급수[2]); i += 1) {
      $studentSelector.append('<option value="2|' + i + '">2학년 ' + i + '반</option>')
    }
    $studentSelector.append('<option value="" disabled>3학년</option>')
    for (let i = 1; i <= Number(comciganData.학급수[3]); i += 1) {
      $studentSelector.append('<option value="3|' + i + '">3학년 ' + i + '반</option>')
    }
    $studentSelector.material_select()
    $('#for-student .select-wrapper ul.select-dropdown li').click(() => {
      updateScheduleViewer('for-student')
    })
    $teacherSelector.empty()
    const teacherNames = comciganData.성명.filter(value => value).sort()
    $teacherSelector.append('<option value="" disabled selected>교사명</option>')
    for (let i = 0, len = teacherNames.length; i < len; i += 1) {
      $teacherSelector.append('<option value="' + teacherNames[i] + '">' + teacherNames[i] + '</option>')
    }
    $teacherSelector.material_select()
    $('#for-teacher .select-wrapper ul.select-dropdown li').click(() => {
      updateScheduleViewer('for-teacher')
    })
  } else {
    Materialize.toast('컴시간 알리미를 사용하지 않는 학교입니다.', 3000)
  }
}

$(document).ready(() => {
  const autoCompleteData = {}
  school.getAll().filter((value) => value.name.search('초등학교') < 0).forEach((value) => { autoCompleteData[value.name] = null })
  $('input.autocomplete#autocomplete-input-school').autocomplete({
    data: autoCompleteData,
    limit: 10,
    onAutocomplete (text) {
      updateSchoolData(text)
    }
  })
  $('select#student').material_select()
  $('select#teacher').material_select()
  $('.tabs').tabs({
    onShow (element) {
      const id = $(element).attr('id')
      showingTab = id
      updateScheduleViewer(id)
    }
  })
  $('.tooltipped').tooltip({delay: 50})
  $('#update').click((element) => {
    updateScheduleViewer(showingTab)
  })
})
