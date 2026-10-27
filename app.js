/* กกบ. Minutes - local-first meeting report editor */
if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.min.js';

const AGENDA_DEFAULTS = [
  'ระเบียบวาระที่ 1 เรื่องที่ประธานฯ แจ้งให้ทราบ',
  'ระเบียบวาระที่ 2 รับรองรายงานการประชุม',
  'ระเบียบวาระที่ 3 ติดตามรายงานการประชุม',
  'ระเบียบวาระที่ 4 เรื่องแจ้งเพื่อทราบ',
  'ระเบียบวาระที่ 5 เรื่องแจ้งเพื่อพิจารณา',
  'ระเบียบวาระที่ 6 เรื่องอื่น ๆ'
];
const AGENDA_DEFAULT_DETAILS = {
  1: 'รับรองการประชุม ครั้งที่ ๑๐/๒๕๖๙ เมื่อวันที่ ๘ กันยายน ๒๕๖๙ ณ ห้องประชุมชั้น ๒ อาคารผู้ป่วยนอก โรงพยาบาลพรหมพิราม ได้จัดส่งรายงานการประชุมฯ ให้คณะกรรมการบริหารโรงพยาบาล เพื่อพิจารณารับรองการประชุมในครั้งนี้แล้ว (รายละเอียดตาม Electronic File ใน Google sites กลุ่มงานยุทธศาสตร์) สามารถสแกน QR Code ตามภาพนี้',
  3: [
    '๑. กลุ่มงานบริหารทั่วไป',
    '   - ไม่มี',
    '๒. กลุ่มงานยุทธศาสตร์',
    '   - ไม่มี',
    '๓. กลุ่มการพยาบาล',
    '   - ไม่มี',
    '๔. กลุ่มงานประกันสุขภาพ',
    '   - ไม่มี',
    '๕. กลุ่มงานปฐมภูมิและองค์รวม',
    '   - ไม่มี',
    '๖. กลุ่มงานกายภาพบำบัด',
    '   - ไม่มี',
    '๗. กลุ่มงานการแพทย์แผนไทยและแพทย์ทางเลือก',
    '   - ไม่มี',
    '๘. กลุ่มงานสุขภาพดิจิทัล',
    '   - ไม่มี',
    '๙. กลุ่มงานเทคนิคการแพทย์',
    '   - ไม่มี',
    '๑๐. กลุ่มงานทันตกรรม',
    '   - ไม่มี',
    '๑๑. กลุ่มงานเภสัชกรรม',
    '   - ไม่มี',
    '๑๒. กลุ่มงานการแพทย์',
    '   - ไม่มี',
    '๑๓. กลุ่มงานรังสีการแพทย์',
    '   - ไม่มี',
    '๑๔. เรื่องแจ้งจากที่ปรึกษา',
    '   - ไม่มี'
  ].join('\n')
};
const AGENDA_DEFAULT_RESOLUTIONS = {1:'รับทราบ'};
const AGENDA_DEFAULT_ISSUES = {
  1: [{details:AGENDA_DEFAULT_DETAILS[1],resolution:AGENDA_DEFAULT_RESOLUTIONS[1]}],
  3: (()=>{const lines=AGENDA_DEFAULT_DETAILS[3].split(/\r?\n/),issues=[];for(let i=0;i<lines.length;i+=2)issues.push({details:[lines[i],lines[i+1]].filter(Boolean).join('\n'),resolution:''});return issues;})()
};
const DEFAULT_MEETING_FIELDS = {
  location: 'ห้องประชุม ชั้น ๒ อาคารผู้ป่วยนอก โรงพยาบาลพรหมพิราม',
  chair: 'นายพุฒิรักษ์ รักย่อง',
  chairPosition: 'นายแพทย์ชำนาญการพิเศษ (ด้านเวชกรรมป้องกัน) รักษาการในตำแหน่ง\nผู้อำนวยการโรงพยาบาลพรหมพิราม',
  recorder: 'น.ส.กัญญารัตน์ มุขแจ้ง',
  recorderPosition: 'พนักงานบริการทั่วไป',
  reviewer: 'น.ส.สกาวพรรณ อวัสดาถาวร',
  reviewerPosition: 'นักสาธารณสุขชำนาญการ',
  attendees: [
    'นายพุฒิรักษ์ รักย่อง — นายแพทย์ชำนาญการพิเศษ',
    'นายฉัตรชัย มาแก้ว — ทันตแพทย์เชี่ยวชาญ',
    'นายคำนบ มากจุ้ย — เภสัชกรชำนาญการพิเศษ',
    'นางสาวณิชากร พัดชุมพร — นายแพทย์ชำนาญการ',
    'นางพรทิพย์ คชหิรัญ — พยาบาลวิชาชีพชำนาญการพิเศษ',
    'นางกัญญารัตน์ วัชรนากรณ์ — พยาบาลวิชาชีพชำนาญการพิเศษ',
    'นางสาวน้ำอ้อย อินทับทิม — เจ้าพนักงานธุรการชำนาญงาน',
    'นางสาวรัชนีวรรณ แฝงกระโทก — นักเทคนิคการแพทย์ชำนาญการ',
    'นางสาวปนัดดา ฝ้ายเทศ — นักกายภาพบำบัดชำนาญการ',
    'นางสาวพวงผกา กะเสาทอง — นักรังสีการแพทย์ปฏิบัติการ',
    'นายทิวา ตินรัตน์ — นักวิชาการคอมพิวเตอร์ชำนาญการ',
    'นายเจริญ คลังเอี่ยม — แพทย์แผนไทยชำนาญการ',
    'นางขวัญนิตย์ พรมแดน — จพ.การเงินและบัญชีปฏิบัติงาน',
    'นางสาวสกาวพรรณ อวัสดาถาวร — นักสาธารณสุขชำนาญการ',
    'นายพิเชษฐ์ วีระกิจพาณิช — นักสาธารณสุขชำนาญการ'
  ].join('\n'),
  absent: [
    'นางสาวสายฝน หาญลิพงศ์ — พยาบาลวิชาชีพชำนาญการ',
    'นายศรสวิน เขียวมี — นักจัดการงานทั่วไปปฏิบัติการ',
    'นางสาวกฤษณา สดพุตุม — นักวิชาการพัสดุ',
    'นายมงคล เงินแจ้ง — นักวิชาการสาธารณสุข'
  ].join('\n'),
  guests: 'นางสาวกัญญารัตน์ มุขแจ้ง — พนักงานบริการทั่วไป'
};
const $ = id => document.getElementById(id);
let sourceFiles = [];
let autoOrganizedIssues = new Map();
let ocrWorker = null;
let ocrWorkerPromise = null;
let ocrActiveEntry = null;
let ocrLastProgressPaint = 0;
let activeReportId = null;
let saveTimer = null;
let toastTimer = null;
let composing = false;

function escapeHtml(value='') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function escapeXml(value='') {
  return String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '\uFFFD').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}
function signatureDisplayName(value='') { return String(value||'').trim().replace(/^น\.ส\.?\s*/u,'นางสาว '); }
function signatureBlocksHtml(d) {
  const block=(name,position,label)=>`<div class="signature-block"><p class="signature-line">ลงชื่อ .................................................... ${escapeHtml(label)}</p><p class="signature-name">(${escapeHtml(signatureDisplayName(name)||'................................')})</p>${multiline(position).map(line=>`<p class="signature-position">${escapeHtml(line)}</p>`).join('')}</div>`;
  return `<div class="signatures">${block(d.recorder,d.recorderPosition,'ผู้บันทึกรายงานการประชุม')}${block(d.reviewer,d.reviewerPosition,'ผู้ตรวจรายงานการประชุม')}${block(d.chair,d.chairPosition,'ผู้รับรองรายงานการประชุม')}</div>`;
}
function multiline(value='') { return String(value).split(/\r?\n/).map(s=>s.trim()).filter(Boolean); }
function agendaIssueRowHtml(agendaIndex,issueIndex,issue={}) {
  const details=String(issue.details||''),resolution=String(issue.resolution||''),detailRows=Math.max(3,Math.min(32,details.split(/\r?\n/).length)),resolutionRows=Math.max(3,Math.min(12,resolution.split(/\r?\n/).length));
  const subIssues=Array.isArray(issue.subIssues)?issue.subIssues:[];
  const subIssueEditor=agendaIndex===3?`<div class="agenda-subissue-list">${subIssues.map((subIssue,index)=>agendaSubIssueRowHtml(index,subIssue)).join('')}</div><button type="button" class="button button-outline button-small agenda-subissue-add" data-agenda-subissue-add="${issueIndex}">＋ เพิ่มเรื่อง / ประเด็น</button>`:'';
  return `<div class="agenda-issue-row" data-agenda-index="${agendaIndex}"><div class="agenda-issue-top"><span class="agenda-issue-number">ประเด็น ${thaiNumeral(issueIndex+1)}</span><button type="button" class="agenda-issue-remove" aria-label="ลบประเด็นที่ ${thaiNumeral(issueIndex+1)}">ลบประเด็น</button></div><label class="agenda-issue-detail"><span>สรุปเรื่อง / สาระสำคัญ / ประเด็น</span><textarea class="agenda-details" data-index="${agendaIndex}" rows="${detailRows}" placeholder="ระบุเรื่องหรือประเด็นที่นำเสนอ">${escapeHtml(details)}</textarea></label><label class="agenda-issue-resolution"><span>มติที่ประชุม</span><textarea class="agenda-resolution" data-index="${agendaIndex}" rows="${resolutionRows}" placeholder="ระบุมติสำหรับประเด็นนี้โดยเฉพาะ">${escapeHtml(resolution)}</textarea></label>${subIssueEditor}</div>`;
}
function agendaSubIssueRowHtml(index,issue={}) {
  const details=String(issue.details||''),resolution=String(issue.resolution||''),detailRows=Math.max(2,Math.min(16,details.split(/\r?\n/).length)),resolutionRows=Math.max(2,Math.min(8,resolution.split(/\r?\n/).length));
  return `<div class="agenda-subissue-row"><div class="agenda-subissue-top"><span>เรื่อง / ประเด็นเพิ่มเติม ${thaiNumeral(index+1)}</span><button type="button" class="agenda-subissue-remove" aria-label="ลบเรื่อง / ประเด็นเพิ่มเติม ${thaiNumeral(index+1)}">ลบ</button></div><label><span>สรุปเรื่อง / สาระสำคัญ / ประเด็น</span><textarea class="agenda-subissue-details" rows="${detailRows}" placeholder="ระบุเรื่องหรือประเด็นเพิ่มเติม">${escapeHtml(details)}</textarea></label><label><span>มติที่ประชุม</span><textarea class="agenda-subissue-resolution" rows="${resolutionRows}" placeholder="ระบุมติสำหรับประเด็นนี้โดยเฉพาะ">${escapeHtml(resolution)}</textarea></label></div>`;
}
function refreshAgendaIssueNumbers(agendaIndex) { const list=document.querySelector(`.agenda-issue-list[data-agenda-index="${agendaIndex}"]`);if(!list)return;[...list.querySelectorAll('.agenda-issue-row')].forEach((row,index)=>{row.querySelector('.agenda-issue-number').textContent=`ประเด็น ${thaiNumeral(index+1)}`;row.querySelector('.agenda-issue-remove').setAttribute('aria-label',`ลบประเด็นที่ ${thaiNumeral(index+1)}`);refreshAgendaSubIssueNumbers(row);}); }
function refreshAgendaSubIssueNumbers(row) { [...row.querySelectorAll('.agenda-subissue-row')].forEach((subIssue,index)=>{subIssue.querySelector('.agenda-subissue-top span').textContent=`เรื่อง / ประเด็นเพิ่มเติม ${thaiNumeral(index+1)}`;subIssue.querySelector('.agenda-subissue-remove').setAttribute('aria-label',`ลบเรื่อง / ประเด็นเพิ่มเติม ${thaiNumeral(index+1)}`);}); }
function renderAgendaIssueRows(agendaIndex,issues=[]) { const list=document.querySelector(`.agenda-issue-list[data-agenda-index="${agendaIndex}"]`);if(!list)return;list.innerHTML=issues.map((issue,index)=>agendaIssueRowHtml(agendaIndex,index,issue)).join('');refreshAgendaIssueNumbers(agendaIndex); }
function readAgendaIssues(agendaIndex) { return [...document.querySelectorAll(`.agenda-issue-row[data-agenda-index="${agendaIndex}"]`)].map(row=>{const issue={details:row.querySelector('.agenda-details')?.value.trim()||'',resolution:row.querySelector('.agenda-resolution')?.value.trim()||''};if(agendaIndex===3)issue.subIssues=[...row.querySelectorAll('.agenda-subissue-row')].map(subIssue=>({details:subIssue.querySelector('.agenda-subissue-details')?.value.trim()||'',resolution:subIssue.querySelector('.agenda-subissue-resolution')?.value.trim()||''})).filter(subIssue=>subIssue.details||subIssue.resolution);return issue;}).filter(issue=>issue.details||issue.resolution||issue.subIssues?.length); }
function addAgendaIssue(agendaIndex) { const list=document.querySelector(`.agenda-issue-list[data-agenda-index="${agendaIndex}"]`);if(!list)return;list.insertAdjacentHTML('beforeend',agendaIssueRowHtml(agendaIndex,list.querySelectorAll('.agenda-issue-row').length,{}));refreshAgendaIssueNumbers(agendaIndex);list.lastElementChild.querySelector('.agenda-details').focus(); }
function addAgendaSubIssue(row) { const details=row?.querySelector('.agenda-details'),subList=row?.querySelector('.agenda-subissue-list');if(!details||!subList)return;if(!subList.children.length)details.value=details.value.split(/\r?\n/).filter(line=>!/^\s*[-–]\s*ไม่มี\s*$/u.test(line)).join('\n');subList.insertAdjacentHTML('beforeend',agendaSubIssueRowHtml(subList.children.length,{}));subList.lastElementChild.querySelector('.agenda-subissue-details').focus(); }
function getAgendaIssues(item={},agendaIndex=0) {
  if(Array.isArray(item.issues))return agendaIndex===3?item.issues.flatMap(issue=>[...(issue.details||issue.resolution?[{details:issue.details||'',resolution:issue.resolution||''}]:[]),...(Array.isArray(issue.subIssues)?issue.subIssues:[])]):item.issues;
  const details=item.details||AGENDA_DEFAULT_DETAILS[agendaIndex]||'';
  if(agendaIndex===1&&details===AGENDA_DEFAULT_DETAILS[1])return [{details,resolution:item.resolution??AGENDA_DEFAULT_RESOLUTIONS[1]}];
  if(agendaIndex===3&&details===AGENDA_DEFAULT_DETAILS[3])return AGENDA_DEFAULT_ISSUES[3];
  return (details||item.resolution)?[{details,resolution:item.resolution||''}]:[];
}
function agendaIssueLabel(issue,index) { return /^[๐-๙\d]+[.)、]/u.test(multiline(issue.details)[0]||'')?'':`ประเด็นที่ ${thaiNumeral(index+1)}`; }
function agendaIssuePreviewHtml(issue,index) {
  const label=agendaIssueLabel(issue,index),details=multiline(issue.details).map(line=>`<p class="agenda-detail">${escapeHtml(line)}</p>`).join(''),resolutions=multiline(issue.resolution);
  const decision=resolutions.length?resolutions.map((line,i)=>`<p class="decision"><strong>${i?'':'มติที่ประชุม : '}</strong>${escapeHtml(line)}</p>`).join(''):'<p class="decision"><strong>มติที่ประชุม :</strong> ........................................................</p>';
  return `<div class="agenda-issue-preview">${label?`<p class="agenda-issue-label">${escapeHtml(label)}</p>`:''}${details||'<p class="agenda-detail">&nbsp;</p>'}${decision}</div>`;
}
function rosterParts(entry='') {
  if(entry&&typeof entry==='object')return {name:String(entry.name||entry.fullName||entry.person||'').trim(),role:String(entry.role||entry.position||'').trim()};
  const [rawName,...rawRole]=String(entry||'').replace(/^\s*[๐-๙\d]+[.)、]\s*/u,'').split(/\s+—\s+/u);
  return {name:(rawName||'').trim(),role:rawRole.join(' — ').trim()};
}
function rosterEntries(value='') { return (Array.isArray(value)?value:multiline(value)).map(rosterParts).filter(person=>person.name||person.role); }
function rosterRowHtml(person={}) { return `<tr><td class="roster-row-number"></td><td><input class="roster-name" aria-label="ชื่อ–สกุล" placeholder="ชื่อ–สกุล" value="${escapeHtml(person.name||'')}"></td><td><input class="roster-role" aria-label="ตำแหน่ง" placeholder="ตำแหน่ง" value="${escapeHtml(person.role||'')}"></td><td class="roster-delete-cell"><button class="roster-remove" type="button" aria-label="ลบรายชื่อ" title="ลบรายชื่อนี้">×</button></td></tr>`; }
function refreshRosterNumbers(key) { [...$(`${key}Rows`).rows].forEach((row,index)=>row.querySelector('.roster-row-number').textContent=thaiNumeral(index+1)); }
function renderRosterTable(key,value='') { const body=$(`${key}Rows`);if(!body)return;const people=rosterEntries(value);body.innerHTML=(people.length?people:[{}]).map(rosterRowHtml).join('');refreshRosterNumbers(key); }
function readRoster(key) { return [...$(`${key}Rows`).rows].map(row=>{const name=row.querySelector('.roster-name')?.value.trim()||'',role=row.querySelector('.roster-role')?.value.trim()||'';return name?(role?`${name} — ${role}`:name):role;}).filter(Boolean).join('\n'); }
function addRosterRow(key) { const body=$(`${key}Rows`);if(!body)return;body.insertAdjacentHTML('beforeend',rosterRowHtml());refreshRosterNumbers(key);body.lastElementChild.querySelector('.roster-name').focus(); }
function toast(message) {
  const box=$('toast'); box.textContent=message; box.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>box.classList.remove('show'),2600);
}
function formatBytes(n) { if(n<1024)return `${n} B`; if(n<1048576)return `${(n/1024).toFixed(0)} KB`; return `${(n/1048576).toFixed(1)} MB`; }
function shortType(file) { const ext=(file.name.split('.').pop()||'FILE').toUpperCase(); return ext.length>5?'FILE':ext; }
function reportTitle(data) { return data.meetingNo ? `ครั้งที่ ${data.meetingNo}` : 'ครั้งที่ ................................'; }
function toMeetingDateInput(value='') {
  const raw=String(value||'').trim();
  const iso=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(iso){const year=Number(iso[1]);return `${year>2400?year-543:year}-${iso[2]}-${iso[3]}`;}
  const numeric=raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if(numeric){let [,day,month,year]=numeric;year=Number(year);if(year>2400)year-=543;return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;}
  const months=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  const thai=raw.match(/^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/);
  if(thai){const month=months.findIndex(m=>m.startsWith(thai[2]));let year=Number(thai[3]);if(year>2400)year-=543;if(month>=0)return `${year}-${String(month+1).padStart(2,'0')}-${String(thai[1]).padStart(2,'0')}`;}
  return '';
}
function formatMeetingDate(value='') {
  const iso=toMeetingDateInput(value);if(!iso)return String(value||'');
  const [year,month,day]=iso.split('-').map(Number);const date=new Date(year,month-1,day,12);
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist',{day:'numeric',month:'long',year:'numeric'}).format(date);
}
function toMeetingTimeInput(value='') {
  const match=String(value||'').match(/(?:^|\D)(\d{1,2})[:.](\d{2})(?:\D|$)/);if(!match)return '';
  const hours=Number(match[1]),minutes=Number(match[2]);if(hours>23||minutes>59)return '';
  return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`;
}
function formatMeetingTime(value='') { return toMeetingTimeInput(value).replace(':','.')||String(value||''); }
function updateMeetingDateDisplay() {
  const date=$('meetingDate')?.value;
  if($('meetingDateDisplay'))$('meetingDateDisplay').textContent=date?`วันที่ ${formatMeetingDate(date)} (พ.ศ.)`:'เลือกวันที่จากปฏิทิน · แสดงปี พ.ศ. ในรายงาน';
}

function renderAgenda(data=[]) {
  $('agendaList').innerHTML=AGENDA_DEFAULTS.map((title,i)=>{
    const item=data[i]||{};
    let issues;
    if(Array.isArray(item.issues))issues=item.issues;
    else if((i===1||i===3)&&(!item.details||item.details===AGENDA_DEFAULT_DETAILS[i]))issues=AGENDA_DEFAULT_ISSUES[i];
    else issues=[{details:item.details??AGENDA_DEFAULT_DETAILS[i]??'',resolution:item.resolution??AGENDA_DEFAULT_RESOLUTIONS[i]??''}];
    const addLabel=i===3?'＋ เพิ่มกลุ่มงาน / ประเด็นย่อย':'＋ เพิ่มเรื่อง / ประเด็น';
    return `<article class="agenda-item"><div class="agenda-top"><span class="agenda-num">${String(i+1).padStart(2,'0')}</span><span class="agenda-name">${escapeHtml(item.title||title)}</span><span class="agenda-tag">วาระ ${i+1}</span></div><div class="agenda-fields"><div class="agenda-issue-list" data-agenda-index="${i}">${issues.map((issue,index)=>agendaIssueRowHtml(i,index,issue)).join('')}</div><button type="button" class="button button-outline button-small agenda-issue-add" data-agenda-issue-add="${i}">${addLabel}</button></div></article>`;
  }).join('');
}

function readForm() {
  const agenda=AGENDA_DEFAULTS.map((title,i)=>{const issues=readAgendaIssues(i),allIssues=i===3?issues.flatMap(issue=>[{details:issue.details,resolution:issue.resolution},...(issue.subIssues||[])]):issues;return {
    title:document.querySelectorAll('.agenda-name')[i]?.textContent||title,
    details:allIssues.map(issue=>issue.details).filter(Boolean).join('\n'),
    resolution:allIssues.map(issue=>issue.resolution).filter(Boolean).join('\n'),issues
  };});
  const actions=[...document.querySelectorAll('#actionRows tr')].map(row=>({
    topic:row.querySelector('.action-topic')?.value||'', owner:row.querySelector('.action-owner')?.value||'', due:row.querySelector('.action-due')?.value||''
  })).filter(a=>a.topic||a.owner||a.due);
  return {
    id:activeReportId, meetingNo:$('meetingNo').value.trim(), meetingDate:$('meetingDate').value, startTime:$('startTime').value, endTime:$('endTime').value, location:$('location').value.trim(), chair:$('chair').value.trim(), chairPosition:$('chairPosition').value.trim(), recorder:$('recorder').value.trim(), recorderPosition:$('recorderPosition').value.trim(), reviewer:$('reviewer').value.trim(), reviewerPosition:$('reviewerPosition').value.trim(), attendees:readRoster('attendees'), absent:readRoster('absent'), guests:readRoster('guests'), agenda, actions,
    sourceNames:sourceFiles.map(f=>f.name), savedAt:new Date().toISOString()
  };
}
function setField(id,value) { $(id).value=Array.isArray(value)?value.join('\n'):(value||''); }
function fillForm(d={}) {
  ['meetingNo','location','chair','chairPosition','recorder','recorderPosition','reviewer','reviewerPosition'].forEach(k=>setField(k,d[k] ?? DEFAULT_MEETING_FIELDS[k] ?? ''));
  ['attendees','absent','guests'].forEach(k=>renderRosterTable(k,d[k] ?? DEFAULT_MEETING_FIELDS[k] ?? ''));
  $('meetingDate').value=toMeetingDateInput(d.meetingDate||'');$('startTime').value=toMeetingTimeInput(d.startTime||'');$('endTime').value=toMeetingTimeInput(d.endTime||'');updateMeetingDateDisplay();
  renderAgenda(d.agenda||[]); drawActions(d.actions||[]); renderPreview();
}

function renderPreview() {
  const d=readForm();
  const any=d.meetingNo||d.meetingDate||d.location||d.attendees||d.agenda.some(a=>a.details||a.resolution)||d.actions.length;
  if(!any){ $('reportPreview').innerHTML='<div class="preview-empty">ตัวอย่างรายงานจะแสดงที่นี่เมื่อกรอกรายละเอียดหรือสร้างร่างแล้ว</div>'; $('exportStatus').classList.remove('ready'); $('exportStatus').textContent='ฉบับร่าง'; return; }
  $('exportStatus').classList.add('ready'); $('exportStatus').textContent='พร้อมตรวจทาน';
  const date=d.meetingDate?`วันที่ ${escapeHtml(thaiNumeral(formatMeetingDate(d.meetingDate)))}`:'วันที่ ................................';
  const venue=d.location?escapeHtml(d.location):'................................';
  const attendance=(text)=>{const people=multiline(text);return `<table class="attendance-table"><colgroup><col class="attendee-number-col"><col class="attendee-name-col"><col class="attendee-role-col"></colgroup><tbody>${(people.length?people:['']).map((person,i)=>{const [name,...role]=person.split(/\s+—\s+/u);return `<tr><td class="attendee-number">${people.length?thaiNumeral(i+1):''}</td><td>${escapeHtml(name)}</td><td>${escapeHtml(role.join(' — '))}</td></tr>`;}).join('')}</tbody></table>`;};
  const agendaHtml=d.agenda.map((a,i)=>{const issues=getAgendaIssues(a,i);return `<p class="agenda-preview-title">${escapeHtml(thaiNumeral(a.title||AGENDA_DEFAULTS[i]))}</p>${issues.length?issues.map((issue,index)=>agendaIssuePreviewHtml(issue,index)).join(''):'<div class="agenda-issue-preview"><p class="decision"><strong>มติที่ประชุม :</strong> ........................................................</p></div>'}`;}).join('');
  const actionTable=d.actions.length?`<h4>รายการติดตาม / มอบหมายงาน</h4><table class="report-table"><thead><tr><th>เรื่อง / งาน</th><th>ผู้รับผิดชอบ</th><th>กำหนดเวลา</th></tr></thead><tbody>${d.actions.map(a=>`<tr><td>${escapeHtml(a.topic)}</td><td>${escapeHtml(a.owner)}</td><td>${escapeHtml(a.due)}</td></tr>`).join('')}</tbody></table>`:'';
  $('reportPreview').innerHTML=`<p class="report-title">รายงานการประชุมคณะกรรมการบริหารโรงพยาบาลพรหมพิราม</p><p class="report-subtitle">${escapeHtml(thaiNumeral(reportTitle(d)))} ${date}</p><p class="report-location">ณ ${venue}</p><h4>ผู้เข้าร่วมประชุม</h4>${attendance(d.attendees)}<h4>ผู้ไม่เข้าร่วมประชุม / ลา</h4>${attendance(d.absent)}${d.guests?`<h4>ผู้เข้าร่วมประชุมเพิ่มเติม</h4>${attendance(d.guests)}`:''}<div class="report-page-break"></div><p class="opening-time"><strong>เปิดประชุมเวลา :</strong> ${escapeHtml(thaiNumeral(formatMeetingTime(d.startTime)||'................'))} น.</p><h4>ก่อนวาระการประชุม</h4>${agendaHtml}${actionTable}<p class="closing-time"><strong>ปิดประชุมเวลา :</strong> ${escapeHtml(thaiNumeral(formatMeetingTime(d.endTime)||'................'))} น.</p>${signatureBlocksHtml(d)}`;
}

function thaiNumeral(value){return String(value).replace(/\d/g,d=>'๐๑๒๓๔๕๖๗๘๙'[Number(d)]);}

function drawActions(items=[]) {
  $('actionRows').innerHTML=items.map(actionRowHtml).join('');
  bindActionRows(); updateEmptyActions();
}
function actionRowHtml(a={}) { return `<tr><td><input class="action-topic" aria-label="เรื่องหรืองาน" placeholder="งานที่มอบหมาย" value="${escapeHtml(a.topic||'')}"></td><td><input class="action-owner" aria-label="ผู้รับผิดชอบ" placeholder="กลุ่มงาน / ชื่อ" value="${escapeHtml(a.owner||'')}"></td><td><input class="action-due" aria-label="กำหนดเวลา" placeholder="เช่น 31 ต.ค. 2569" value="${escapeHtml(a.due||'')}"></td><td><button class="action-remove" type="button" aria-label="ลบรายการ">×</button></td></tr>`; }
function bindActionRows() { document.querySelectorAll('#actionRows input').forEach(x=>x.addEventListener('input',queueSaveAndPreview)); document.querySelectorAll('.action-remove').forEach(x=>x.addEventListener('click',e=>{e.currentTarget.closest('tr').remove();updateEmptyActions();queueSaveAndPreview();})); }
function updateEmptyActions(){ $('emptyActions').style.display=$('actionRows').children.length?'none':'block'; }

function getReports(){ try{return JSON.parse(localStorage.getItem('gkbMinutesReports')||'[]');}catch{return [];} }
function queueSaveAndPreview(){ renderPreview(); if(composing)return; clearTimeout(saveTimer); saveTimer=setTimeout(saveCurrent,650); }
function saveCurrent(){
  const d=readForm(); if(!d.meetingNo&&!d.meetingDate&&!d.agenda.some(a=>a.details||a.resolution)&&!d.attendees)return;
  if(!activeReportId)activeReportId=crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`;
  d.id=activeReportId; d.savedAt=new Date().toISOString();
  const existing=getReports().filter(r=>r.id!==activeReportId); const reports=[d,...existing].slice(0,30);
  try{localStorage.setItem('gkbMinutesReports',JSON.stringify(reports));$('saveStatus').innerHTML='<i></i> บันทึกร่างแล้ว';renderHistory();}catch{$('saveStatus').innerHTML='<i></i> พื้นที่บันทึกเต็ม';}
}
function niceDate(value){ if(!value)return 'ยังไม่ระบุวันที่'; try{return new Date(value).toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short'});}catch{return value;} }
function renderHistory(){
  const reports=getReports(); $('documentCount').textContent=`${reports.length} ฉบับ`; $('historyCount').textContent=`${reports.length} รายการ`;
  $('historyEmpty').style.display=reports.length?'none':'block'; $('historyList').innerHTML=reports.map(r=>`<div class="history-row"><div class="history-main"><span class="history-file">▤</span><div><strong>รายงานการประชุม ${escapeHtml(r.meetingNo?`ครั้งที่ ${r.meetingNo}`:'ฉบับร่าง')}</strong><small>${escapeHtml(r.meetingDate?formatMeetingDate(r.meetingDate):'ยังไม่ระบุวันที่')} · แก้ไข ${escapeHtml(niceDate(r.savedAt))}</small></div></div><div class="history-actions"><button type="button" data-open="${escapeHtml(r.id)}">เปิดแก้ไข</button><button type="button" class="history-delete" data-delete-report="${escapeHtml(r.id)}" aria-label="ลบรายงานนี้">ลบ</button></div></div>`).join('');
  document.querySelectorAll('[data-open]').forEach(btn=>btn.addEventListener('click',()=>openReport(btn.dataset.open)));
  document.querySelectorAll('[data-delete-report]').forEach(btn=>btn.addEventListener('click',()=>deleteReport(btn.dataset.deleteReport)));
}
function deleteReport(id){
  const reports=getReports();if(!reports.some(report=>report.id===id))return;
  try{localStorage.setItem('gkbMinutesReports',JSON.stringify(reports.filter(report=>report.id!==id)));}
  catch{toast('ลบรายงานไม่สำเร็จ พื้นที่จัดเก็บในเบราว์เซอร์อาจมีปัญหา');return;}
  if(activeReportId===id){clearTimeout(saveTimer);activeReportId=null;$('saveStatus').innerHTML='<i></i> ลบฉบับที่บันทึกแล้ว · ข้อมูลในแบบฟอร์มยังอยู่';}
  renderHistory();toast('ลบรายงานออกจากรายการแล้ว');
}
function openReport(id){ const r=getReports().find(x=>x.id===id);if(!r)return;activeReportId=id;sourceFiles=[];autoOrganizedIssues=new Map();drawFiles();composing=true;fillForm(r);composing=false;window.scrollTo({top:0,behavior:'smooth'});toast('เปิดฉบับร่างแล้ว'); }
function newReport(){ if(activeReportId)saveCurrent();activeReportId=null;sourceFiles=[];autoOrganizedIssues=new Map();clearInputs();drawFiles();renderAgenda();drawActions();renderPreview();$('meetingNo').focus();$('saveStatus').innerHTML='<i></i> รายงานใหม่';window.scrollTo({top:0,behavior:'smooth'}); }
function clearInputs(){
  $('meetingNo').value='';$('meetingDate').value='';$('startTime').value='';$('endTime').value='';
  ['location','chair','chairPosition','recorder','recorderPosition','reviewer','reviewerPosition'].forEach(id=>$(id).value=DEFAULT_MEETING_FIELDS[id]);
  ['attendees','absent','guests'].forEach(key=>renderRosterTable(key,DEFAULT_MEETING_FIELDS[key]));
  updateMeetingDateDisplay();$("generateStatus").textContent="ระบบถอดเสียงและจัดข้อความในเครื่อง";
}

async function handleFiles(fileList){
  for(const file of [...fileList]){
    if(sourceFiles.some(f=>f.name===file.name&&f.size===file.size)){toast(`ข้ามไฟล์ซ้ำ: ${file.name}`);continue;}
    const entry={id:`f${Date.now()}${Math.random()}`,name:file.name,size:file.size,type:file.type,kind:'',text:'',baseText:'',images:[],imagePages:[],ocrPages:[],ocrText:'',ocrProcessing:false,ocrError:'',status:'กำลังอ่าน...',error:'',file};sourceFiles.push(entry);drawFiles();
    try{ await processSourceFile(entry); if(!entry.error)entry.status=entry.kind==='audio'?'พร้อมถอดเสียง':'อ่านแล้ว'; }
    catch(err){entry.error=err.message||'ไม่สามารถอ่านไฟล์นี้ได้';entry.status='อ่านไม่ได้';}
    drawFiles();
  }
  $('fileInput').value=''; updateImportSummary();
}

async function processSourceFile(entry){
  const file=entry.file,ext=(file.name.split('.').pop()||'').toLowerCase();
  if(['mp3','m4a','wav','mp4','mpeg','mpga','webm','ogg'].includes(ext)||file.type.startsWith('audio/')){entry.kind='audio';entry.status='พร้อมถอดเสียง';return;}
  if(ext==='pdf'||file.type==='application/pdf'){
    if(!window.pdfjsLib)throw new Error('ไม่พบตัวอ่าน PDF');
    const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;entry.kind='pdf';const textParts=[];const maxPages=40;
    for(let n=1;n<=Math.min(pdf.numPages,maxPages);n++){
      const page=await pdf.getPage(n);const content=await page.getTextContent();const text=content.items.map(i=>i.str).join(' ').replace(/\s+/g,' ').trim();
      if(text.length>20)textParts.push(`[${file.name} · หน้า ${n}]\n${text}`);
      else if(entry.images.length<20){const vp=page.getViewport({scale:1.65});const canvas=document.createElement('canvas');canvas.width=Math.round(vp.width);canvas.height=Math.round(vp.height);await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;entry.images.push(canvas.toDataURL('image/jpeg',0.88));entry.imagePages.push(n);canvas.width=canvas.height=1;}
    }
    if(pdf.numPages>maxPages)entry.status=`อ่าน ${maxPages} จาก ${pdf.numPages} หน้า`;
    entry.text=textParts.join('\n\n');entry.baseText=entry.text;if(!entry.text&&!entry.images.length)throw new Error('ไม่พบข้อความหรือภาพใน PDF');return;
  }
  if(ext==='docx'){
    if(!window.mammoth)throw new Error('ไม่พบตัวอ่าน Word');const result=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});entry.text=result.value.trim();entry.kind='docx';if(!entry.text)throw new Error('ไม่พบข้อความในเอกสาร');return;
  }
  if(['xlsx','xls','xlsm','xlsb'].includes(ext)){
    if(!window.XLSX)throw new Error('ไม่พบตัวอ่าน Excel');const wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true});entry.kind='spreadsheet';entry.text=wb.SheetNames.slice(0,12).map(name=>`[${file.name} · แผ่นงาน ${name}]\n${XLSX.utils.sheet_to_csv(wb.Sheets[name],{blankrows:false}).slice(0,50000)}`).join('\n\n');if(!entry.text.trim())throw new Error('ไม่พบข้อมูลในตาราง');return;
  }
  if(ext==='pptx'){
    if(!window.JSZip)throw new Error('ไม่พบตัวอ่าน PowerPoint');const zip=await JSZip.loadAsync(await file.arrayBuffer());const slides=Object.keys(zip.files).filter(p=>/^ppt\/slides\/slide\d+\.xml$/.test(p)).sort((a,b)=>Number(a.match(/slide(\d+)/)[1])-Number(b.match(/slide(\d+)/)[1]));const parts=[];
    for(const name of slides){const xml=await zip.file(name).async('string');const doc=new DOMParser().parseFromString(xml,'application/xml');const vals=[...doc.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main','t')].map(n=>n.textContent);parts.push(`[${name.split('/').pop()}]\n${vals.join(' ')}`);}
    entry.kind='pptx';entry.text=parts.join('\n\n');if(!entry.text.trim())throw new Error('ไม่พบข้อความในสไลด์');return;
  }
  if(ext==='doc'||ext==='ppt')throw new Error(`ไฟล์ .${ext} รุ่นเก่า: กรุณาบันทึกเป็น .docx หรือ .pptx ก่อนนำเข้า`);
  if(file.type.startsWith('image/')||['png','jpg','jpeg','webp','gif','bmp','svg'].includes(ext)){
    if(entry.size>20*1024*1024)throw new Error('ภาพมีขนาดเกิน 20 MB');const bitmap=await createImageBitmap(file);const scale=Math.min(1,2200/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);entry.images=[canvas.toDataURL('image/jpeg',0.9)];entry.imagePages=[1];entry.kind='image';bitmap.close();return;
  }
  const text=await file.text();const printable=text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'');if(text.includes('\u0000')||printable.trim().length<Math.min(20,file.size*.08))throw new Error('ไม่รู้จักรูปแบบไฟล์นี้ ลองแปลงเป็น PDF, DOCX, XLSX, PPTX, TXT หรือภาพ');entry.kind='text';entry.text=printable.slice(0,100000);if(ext==='rtf')entry.text=entry.text.replace(/\\[a-z]+-?\d* ?|[{}]/gi,' ');
}

function fileEntryHtml(f){
  const hasPendingOcr=f.images?.length&&(f.ocrPages?.length||0)<f.images.length;
  const statusClass=f.error||f.ocrError?'error':'';
  const ocrButton=hasPendingOcr?` <button class="text-button ocr-btn" type="button" ${(f.ocrProcessing||ocrActiveEntry&&ocrActiveEntry!==f)?'disabled':''} data-ocr="${escapeHtml(f.id)}">${f.ocrProcessing?'กำลังอ่าน OCR…':f.ocrError?'ลอง OCR อีกครั้ง':'อ่าน OCR'}</button>`:'';
  const audioButton=f.kind==='audio'?` <button class="text-button transcribe-btn" type="button" ${f.processing?'disabled':''} data-id="${escapeHtml(f.id)}">${f.processing?'กำลังประมวลผล…':f.error?'ลองถอดเสียงอีกครั้ง':'ถอดเสียง'}</button>`:'';
  const error=f.error?`<div class="file-error-detail">รายละเอียด: ${escapeHtml(f.error)}</div>`:'';
  const ocrError=f.ocrError?`<div class="file-error-detail">รายละเอียด OCR: ${escapeHtml(f.ocrError)}</div>`:'';
  const ocrText=f.ocrText?`<details class="transcript-panel ocr-panel" open><summary>ข้อความ OCR จาก ${escapeHtml(f.name)}</summary><button class="text-button" type="button" data-copy-ocr="${escapeHtml(f.id)}">คัดลอกข้อความ</button><pre class="transcript-text">${escapeHtml(f.ocrText)}</pre></details>`:'';
  const transcript=f.kind==='transcript'&&f.text?`<details class="transcript-panel" open><summary>ข้อความถอดเสียงจาก ${escapeHtml(f.name)}</summary><button class="text-button transcript-copy" type="button" data-copy-transcript="${escapeHtml(f.id)}">คัดลอกข้อความ</button><pre class="transcript-text">${escapeHtml(f.text)}</pre></details>`:'';
  const kind=f.kind==='audio'?'รอถอดเสียง':f.kind==='pdf'&&f.images.length?'PDF พร้อมภาพสแกน':f.kind||'กำลังประมวลผล';
  return `<div class="file-entry"><div class="file-row"><div class="file-type-icon">${escapeHtml(shortType(f.file))}</div><div><div class="file-name" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</div><div class="file-meta">${formatBytes(f.size)} · ${escapeHtml(kind)}</div></div><div class="file-status ${statusClass}" title="${escapeHtml(f.error||f.ocrError||f.status)}">${f.error?escapeHtml(f.error):f.status}${audioButton}${ocrButton} <button class="remove-file" type="button" title="นำไฟล์ออก" ${(f.processing||f.ocrProcessing)?'disabled':''} data-remove="${escapeHtml(f.id)}">×</button></div></div>${error}${ocrError}${ocrText}${transcript}</div>`;
}
function drawFiles(){
  $('fileList').innerHTML=sourceFiles.map(fileEntryHtml).join('');
  document.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{sourceFiles=sourceFiles.filter(f=>f.id!==btn.dataset.remove);drawFiles();updateImportSummary();}));
  document.querySelectorAll('.transcribe-btn').forEach(btn=>btn.addEventListener('click',()=>transcribeFile(btn.dataset.id,btn)));
  document.querySelectorAll('.ocr-btn').forEach(btn=>btn.addEventListener('click',()=>runOcr(btn.dataset.ocr)));
  document.querySelectorAll('[data-copy-transcript]').forEach(btn=>btn.addEventListener('click',async()=>{const file=sourceFiles.find(f=>f.id===btn.dataset.copyTranscript);if(!file)return;try{await navigator.clipboard.writeText(file.text);toast('คัดลอกข้อความถอดเสียงแล้ว');}catch{toast('เลือกข้อความในกรอบแล้วกด Ctrl+C เพื่อคัดลอก');}}));
  document.querySelectorAll('[data-copy-ocr]').forEach(btn=>btn.addEventListener('click',async()=>{const file=sourceFiles.find(f=>f.id===btn.dataset.copyOcr);if(!file)return;try{await navigator.clipboard.writeText(file.ocrText);toast('คัดลอกข้อความ OCR แล้ว');}catch{toast('เลือกข้อความในกรอบแล้วกด Ctrl+C เพื่อคัดลอก');}}));
  updateImportSummary();
}
function updateImportSummary(){const parsed=sourceFiles.filter(f=>!f.error&&f.kind).length;$('importSummary').textContent=sourceFiles.length?`${sourceFiles.length} ไฟล์ · อ่านได้ ${parsed} ไฟล์`:'ยังไม่มีไฟล์';}

const LOCAL_TRANSCRIBE_CHUNK_SECONDS = 600;
const LOCAL_SERVER_ORIGIN = 'http://127.0.0.1:8766/';
const TRANSCRIPTION_MODE_KEY = 'gkb-transcription-mode-v2';
let ffmpegInstance = null;
let ffmpegPromise = null;
let ffmpegQueue = Promise.resolve();
let ffmpegBlobUrls = [];
let ffmpegRuntimeScriptUrl = '';

function selectedTranscriptionMode() {
  return $('transcriptionMode')?.value === 'accurate' ? 'accurate' : 'fast';
}

function transcriptionErrorMessage(error) {
  console.error('[กกบ. Minutes] ถอดเสียงไม่สำเร็จ:', error);
  if (typeof error === 'string' && error.trim()) return error.trim();
  if (typeof error?.message === 'string' && error.message.trim()) return error.message.trim();
  if (typeof error?.name === 'string' && error.name) return `${error.name}: ไม่มีรายละเอียดจากตัวถอดเสียง`;
  try {
    const details = JSON.stringify(error);
    if (details && details !== '{}' && details !== 'null') return details;
  } catch {}
  return 'ตัวถอดเสียงไม่ส่งรายละเอียดข้อผิดพลาดกลับมา ตรวจดู Console ของเบราว์เซอร์เพื่อหาสาเหตุ';
}

function appAssetUrl(path) {
  if(location.protocol==='file:')return new URL(path,LOCAL_SERVER_ORIGIN).href;
  const appScript = [...document.scripts].find(script => /(?:^|\/)app\.js(?:[?#]|$)/i.test(script.src));
  const appBase = appScript ? new URL('.', appScript.src) : new URL('.', document.baseURI);
  return new URL(path, appBase).href;
}

function reportOcrProgress(message){
  if(!ocrActiveEntry||!message?.status)return;
  const percent=Number.isFinite(message.progress)?` ${Math.round(message.progress*100)}%`:'';
  const labels={'loading tesseract core':'กำลังโหลดตัว OCR','loading language traineddata':'กำลังโหลดโมเดลภาษาไทย','initializing tesseract':'กำลังเริ่ม OCR','recognizing text':'กำลังอ่านข้อความ'};
  ocrActiveEntry.status=`${labels[message.status]||message.status}${percent}`;
  const now=Date.now();
  if(now-ocrLastProgressPaint>450){ocrLastProgressPaint=now;drawFiles();}
}

async function getOcrWorker(){
  if(ocrWorker)return ocrWorker;
  if(!window.Tesseract?.createWorker)throw new Error('ไม่พบตัวอ่าน OCR ในเครื่อง ตรวจสอบไฟล์ lib/ocr');
  if(!ocrWorkerPromise){
    ocrWorkerPromise=window.Tesseract.createWorker('tha',1,{
      workerPath:appAssetUrl('lib/ocr/worker.min.js'),
      langPath:appAssetUrl('lib/ocr/lang'),
      corePath:appAssetUrl('lib/ocr/core'),
      gzip:true,
      logger:reportOcrProgress
    }).then(worker=>(ocrWorker=worker)).catch(error=>{ocrWorkerPromise=null;throw error;});
  }
  return ocrWorkerPromise;
}

async function runOcr(id){
  const entry=sourceFiles.find(file=>file.id===id);if(!entry||!entry.images?.length||entry.ocrProcessing||ocrActiveEntry)return;
  entry.ocrProcessing=true;entry.ocrError='';entry.status='กำลังเตรียม OCR';ocrActiveEntry=entry;drawFiles();
  try{
    const worker=await getOcrWorker();
    const pages=entry.imagePages?.length?entry.imagePages:entry.images.map((_,index)=>index+1);
    entry.ocrPages=Array.isArray(entry.ocrPages)?entry.ocrPages:[];
    for(let index=0;index<entry.images.length;index++){
      const page=pages[index]??index+1;
      if(entry.ocrPages.some(item=>item.page===page&&item.text))continue;
      entry.status=`กำลังอ่าน OCR หน้า ${page} (${index+1}/${entry.images.length})`;drawFiles();
      const result=await worker.recognize(entry.images[index]);
      const text=String(result?.data?.text||'').trim();
      if(text)entry.ocrPages.push({page,text});
      entry.ocrPages.sort((a,b)=>a.page-b.page);
      entry.ocrText=entry.ocrPages.map(item=>`[${entry.name} · หน้า ${item.page}]\n${item.text}`).join('\n\n');
      entry.text=[entry.baseText||'',entry.ocrText].filter(Boolean).join('\n\n');
      drawFiles();
    }
    entry.ocrText=entry.ocrPages.map(item=>`[${entry.name} · หน้า ${item.page}]\n${item.text}`).join('\n\n');
    entry.text=[entry.baseText||'',entry.ocrText].filter(Boolean).join('\n\n');
    if(entry.ocrText){entry.status=`อ่าน OCR แล้ว ${entry.ocrPages.length}/${entry.images.length} หน้า`;entry.ocrError='';toast('อ่านข้อความ OCR แล้ว ข้อความแสดงใต้ไฟล์และนำไปจัดเข้าวาระได้');}
    else{entry.status='OCR ไม่พบข้อความ';entry.ocrError='ไม่พบข้อความที่อ่านได้ ลองใช้ภาพที่คมชัดและวางตรง';toast('OCR ไม่พบข้อความในภาพนี้');}
  }catch(error){
    console.error('[กกบ. Minutes] OCR ไม่สำเร็จ:',error);entry.ocrError=error?.message||String(error);entry.status='OCR อ่านไม่สำเร็จ';try{await ocrWorker?.terminate();}catch{}ocrWorker=null;ocrWorkerPromise=null;toast('OCR อ่านไม่สำเร็จ โปรดดูรายละเอียดใต้ไฟล์');
  }finally{
    entry.ocrProcessing=false;if(ocrActiveEntry===entry)ocrActiveEntry=null;drawFiles();
  }
}

function isLocalTranscriptionPage() {
  return (location.hostname === '127.0.0.1' || location.hostname === 'localhost')
    && location.port === '8766';
}

function localTranscriptionUrl(path) {
  if (!isLocalTranscriptionPage()) {
    throw new Error('การถอดเสียงต้องเปิดจากแอปบนเครื่อง กรุณาเปิด start-app.bat แล้วเลือกไฟล์เสียงในหน้าแอปบนเครื่อง');
  }
  return new URL(path, location.origin + '/').href;
}

async function ensureLocalTranscriptionService() {
  let response;
  try {
    response = await fetch(localTranscriptionUrl('/api/health'), {
      cache: 'no-store',
    });
  } catch {
    throw new Error('เชื่อมต่อ Whisper ในเครื่องไม่ได้ กรุณาเปิด start-app.bat แล้วใช้หน้าแอปบนเครื่องที่ http://127.0.0.1:8766/');
  }
  if (!response.ok) {
    throw new Error('บริการถอดเสียงในเครื่องตอบกลับผิดพลาด (' + response.status + ') กรุณาปิดแล้วเปิด start-app.bat ใหม่');
  }
  const health = await response.json().catch(() => ({}));
  if (!health.ok) {
    throw new Error('บริการ Whisper ในเครื่องยังไม่พร้อม กรุณาตรวจสอบหน้าต่าง start-app.bat');
  }
}

async function fetchFfmpegAsset(path) {
  let response;
  try {
    response = await fetch(appAssetUrl(path));
  } catch {
    throw new Error(`เชื่อมต่อไฟล์ประมวลผลเสียงไม่ได้ กรุณาเปิด start-app.bat ค้างไว้ แล้วลองอีกครั้ง (${path})`);
  }
  if (!response.ok) throw new Error(`โหลดไฟล์ประมวลผลเสียงไม่สำเร็จ (${response.status}): ${path}`);
  return response;
}

function loadFfmpegScript() {
  return (async () => {
    let sourceUrl = appAssetUrl('lib/ffmpeg/ffmpeg.js');
    if (location.protocol === 'file:') {
      const response = await fetchFfmpegAsset('lib/ffmpeg/ffmpeg.js');
      let source = await response.text();
      const workerLoadPattern = /load=\(\{classWorkerURL:s,\.\.\.r\}=\{\},\{signal:a\}=\{\}\)=>\(this\.#e\|\|\(this\.#e=s\?new Worker\(new URL\(s,"[^"]+"\),\{type:"module"\}\):new Worker\(new URL\(e\.p\+e\.u\(814\),e\.b\),\{type:void 0\}\),this\.#o\(\)\),this\.#i\(\{type:t\.LOAD,data:r\},void 0,a\)\);/;
      const workerLoadPatch = 'load=({workerURL:s,...r}={}, {signal:a}={})=>(this.#e||(this.#e=new Worker(s||new URL(e.p+e.u(814),e.b),{type:"classic"}),this.#o()),this.#i({type:t.LOAD,data:r},void 0,a));';
      if (!workerLoadPattern.test(source)) throw new Error('ไฟล์ FFmpeg ไม่รองรับการเปิดจาก index.html โดยตรง กรุณาอัปเดตไฟล์แอป');
      source = source.replace(workerLoadPattern, workerLoadPatch);
      ffmpegRuntimeScriptUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
      sourceUrl = ffmpegRuntimeScriptUrl;
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = sourceUrl;
      script.onload = () => {
        if (ffmpegRuntimeScriptUrl) {
          URL.revokeObjectURL(ffmpegRuntimeScriptUrl);
          ffmpegRuntimeScriptUrl = '';
        }
        resolve();
      };
      script.onerror = () => {
        if (ffmpegRuntimeScriptUrl) {
          URL.revokeObjectURL(ffmpegRuntimeScriptUrl);
          ffmpegRuntimeScriptUrl = '';
        }
        reject(new Error(`เชื่อมต่อตัวช่วยเสียงไม่สำเร็จ กรุณาเปิด start-app.bat ค้างไว้ แล้วเปิด index.html หรือแอปที่ ${LOCAL_SERVER_ORIGIN} ใหม่ (ไฟล์: ${script.src})`));
      };
      document.head.appendChild(script);
    });
  })();
}

async function loadFfmpegBlobAsset(path, type) {
  const response = await fetchFfmpegAsset(path);
  const url = URL.createObjectURL(new Blob([await response.arrayBuffer()], { type }));
  ffmpegBlobUrls.push(url);
  return url;
}

async function loadFfmpegWasmAsset() {
  let response;
  try {
    response = await fetchFfmpegAsset('lib/ffmpeg/ffmpeg-core.wasm.gz');
  } catch {
    const original = await fetchFfmpegAsset('lib/ffmpeg/ffmpeg-core.wasm');
    return original.url;
  }
  if (typeof DecompressionStream !== 'function') {
    const original = await fetchFfmpegAsset('lib/ffmpeg/ffmpeg-core.wasm');
    return original.url;
  }
  const decompressed = response.body.pipeThrough(new DecompressionStream('gzip'));
  const bytes = await new Response(decompressed).arrayBuffer();
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/wasm' }));
  ffmpegBlobUrls.push(url);
  return url;
}

function releaseFfmpegBlobAssets() {
  for (const url of ffmpegBlobUrls) URL.revokeObjectURL(url);
  ffmpegBlobUrls = [];
}

async function getFfmpeg() {
  if (ffmpegInstance?.loaded) return ffmpegInstance;
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      if (!window.FFmpegWASM) await loadFfmpegScript();
      const FFmpeg = window.FFmpegWASM?.FFmpeg;
      if (!FFmpeg) throw new Error('ไม่พบตัวช่วยประมวลผลเสียง FFmpeg');
      const ffmpeg = new FFmpeg();
      let workerURL;
      let coreURL = appAssetUrl('lib/ffmpeg/ffmpeg-core.js');
      const wasmURL = await loadFfmpegWasmAsset();
      if (location.protocol === 'file:') {
        workerURL = await loadFfmpegBlobAsset('lib/ffmpeg/814.ffmpeg.js', 'text/javascript');
      }
      try {
        await ffmpeg.load({ ...(workerURL ? { workerURL } : {}), coreURL, wasmURL });
      } catch (error) {
        ffmpeg.terminate();
        throw error;
      }
      ffmpegInstance = ffmpeg;
      return ffmpeg;
    })().catch(error => {
      releaseFfmpegBlobAssets();
      ffmpegPromise = null;
      throw error;
    });
  }
  return ffmpegPromise;
}

async function transcribeChunkLocally(bytes,entry,part,total) {
  const mode=entry.transcriptionMode||selectedTranscriptionMode();
  entry.status='กำลังถอดเสียง '+(mode==='fast'?'โหมดเร็ว':'โหมดแม่นยำ')+' ช่วง '+part+'/'+total+' · Whisper.cpp CPU…';
  drawFiles();
  const response=await fetch(localTranscriptionUrl('/api/transcribe-local'),{method:'POST',headers:{'Content-Type':'audio/wav','X-Transcription-Model':mode},body:bytes});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||'ถอดเสียงในเครื่องไม่สำเร็จ');
  entry.transcriptionDevice='cpu';
  return String(data.text||'').trim();
}
async function transcribeLocally(entry) {
  const ffmpeg=await getFfmpeg();
  const token='gkb_local_'+Date.now()+'_'+Math.random().toString(16).slice(2,8);
  const inputDir='/'+token+'_input';
  const inputName=inputDir+'/'+entry.file.name;
  const outputPrefix=token+'_part_';
  let outputNames=[];
  let inputMounted=false;
  try {
    entry.status='กำลังเตรียมเสียงในเครื่อง…';
    drawFiles();
    await ffmpeg.createDir(inputDir);
    await ffmpeg.mount('WORKERFS',{files:[entry.file]},inputDir);
    inputMounted=true;
    const exitCode=await ffmpeg.exec([
      '-hide_banner','-loglevel','error','-i',inputName,
      '-map','0:a:0','-vn','-ac','1','-ar','16000',
      '-c:a','pcm_s16le','-f','segment','-segment_time',String(LOCAL_TRANSCRIBE_CHUNK_SECONDS),
      '-reset_timestamps','1','-segment_format','wav',outputPrefix+'%03d.wav'
    ]);
    if(exitCode!==0)throw new Error('แปลงไฟล์เสียงไม่สำเร็จ ตรวจสอบว่าไฟล์เปิดฟังได้ตามปกติ');
    await ffmpeg.unmount(inputDir);
    inputMounted=false;
    const files=await ffmpeg.listDir('/');
    outputNames=files.map(item=>item.name).filter(name=>name.startsWith(outputPrefix)&&name.endsWith('.wav')).sort((a,b)=>Number(a.match(/(\d+)\.wav$/)?.[1]||0)-Number(b.match(/(\d+)\.wav$/)?.[1]||0));
    if(!outputNames.length)throw new Error('ไม่พบช่วงเสียงหลังแปลงไฟล์');
    const transcripts=[];
    for(let i=0;i<outputNames.length;i++){
      const bytes=await ffmpeg.readFile(outputNames[i]);
      transcripts.push(await transcribeChunkLocally(bytes,entry,i+1,outputNames.length));
    }
    return transcripts.filter(Boolean).join('\n\n');
  } finally {
    if(inputMounted){try{await ffmpeg.unmount(inputDir);}catch{}}
    try{await ffmpeg.deleteDir(inputDir);}catch{}
    for(const name of outputNames){try{await ffmpeg.deleteFile(name);}catch{}}
  }
}
function queueLocalAudio(entry) {
  const task=ffmpegQueue.then(()=>transcribeLocally(entry));
  ffmpegQueue=task.catch(()=>{});
  return task;
}
async function transcribeFile(id,button) {
  const file=sourceFiles.find(item=>item.id===id);
  if(!file||file.processing)return;
  file.processing=true;
  file.transcriptionMode=selectedTranscriptionMode();
  file.transcriptionDevice='';
  file.status='กำลังถอดเสียง '+(file.transcriptionMode==='fast'?'โหมดเร็ว · Whisper Tiny':'โหมดแม่นยำ · Typhoon ภาษาไทย')+'…';
  file.error='';
  drawFiles();
  try {
    if (!isLocalTranscriptionPage()) {
      throw new Error('หน้านี้ไม่ถอดเสียงโดยเชื่อมต่อข้ามเว็บไซต์ ให้เปิด start-app.bat แล้วเลือกไฟล์เสียงในหน้าแอปบนเครื่อง เพื่อใช้งานโดยไม่ต้องให้ Chrome ขอสิทธิ์');
    }
    await ensureLocalTranscriptionService();
    const transcript=await queueLocalAudio(file);
    file.kind='transcript';
    file.text='[ถอดเสียง: '+file.name+']\n'+transcript;
    file.status='ถอดเสียงแล้ว · '+(file.transcriptionMode==='fast'?'Whisper Tiny':'Typhoon ภาษาไทย')+' CPU';
    file.error='';
    toast('เพิ่มข้อความถอดเสียงในแหล่งข้อมูลแล้ว');
    queueSaveAndPreview();
  } catch(error) {
    file.status='ถอดเสียงไม่สำเร็จ';
    file.error=transcriptionErrorMessage(error);
    toast(file.error);
  } finally {
    file.processing=false;
    drawFiles();
  }
}

function spokenAgendaNumber(label) {
  const thaiDigits='๐๑๒๓๔๕๖๗๘๙';
  const normalized=label.replace(/[๐-๙]/g,d=>String(thaiDigits.indexOf(d))).trim();
  const words={'หนึ่ง':1,'สอง':2,'สาม':3,'สี่':4,'ห้า':5,'หก':6};
  return Number(normalized)||words[label]||0;
}
function parseAgendaPoint(section) {
  const decision=section.match(/(?:มติ(?:ที่ประชุม)?|ที่ประชุมมีมติ)\s*[:：]?\s*([\s\S]+)$/u);
  return {details:decision?section.slice(0,decision.index).trim():section.trim(),resolution:decision?decision[1].trim():''};
}
function splitAgendaSectionIssues(section) {
  const lines=String(section||'').split(/\r?\n/);
  const starts=[];
  lines.forEach((line,index)=>{if(/^\s*(?:\d+|[๐-๙]+)[.)、]\s*/u.test(line))starts.push(index);});
  if(starts.length<2)return [parseAgendaPoint(section)];
  const prefix=lines.slice(0,starts[0]).join('\n').trim();
  const chunks=starts.map((start,index)=>lines.slice(start,index+1<starts.length?starts[index+1]:lines.length).join('\n').trim());
  if(prefix)chunks[0]=prefix+'\n'+chunks[0];
  return chunks.filter(Boolean).map(parseAgendaPoint);
}
async function organizeTranscriptIntoAgenda() {
  const sources=sourceFiles.filter(file=>file.text&&!file.error);
  if(!sources.length){
    const message=sourceFiles.some(file=>file.images?.length)?'พบภาพหรือหน้า PDF สแกน กด “อ่าน OCR” ข้างไฟล์ก่อน แล้วจึงกดจัดข้อความลงวาระ':'เพิ่มไฟล์ที่อ่านเนื้อหาได้ หรือถอดเสียงก่อนจัดข้อความลงวาระ';
    $('generateStatus').textContent=message;
    toast(message);
    return;
  }
  const text=sources.map(file=>'===== '+file.name+' =====\n'+file.text).join('\n\n');
  const marker=/(?:ระเบียบ\s*)?วาระ\s*(?:ที่\s*)?(หนึ่ง|สอง|สาม|สี่|ห้า|หก|[1-6๑-๖])\s*/gu;
  const matches=[...text.matchAll(marker)];
  if(!matches.length){
    $('generateStatus').textContent='ไม่พบเลขวาระที่ระบุชัดเจนในข้อความ ระบบจึงไม่เดาหมวดให้อัตโนมัติ ข้อความถอดเสียงยังแสดงให้ตรวจและคัดลอกไปแก้ไขในแต่ละวาระได้';
    toast('ไม่พบหัวข้อวาระในไฟล์ ให้ตรวจข้อความและใส่ประเด็นเอง');
    return;
  }
  const grouped=new Map();
  const routed=new Map();
  for(let index=0;index<matches.length;index++){
    const match=matches[index];
    const agendaIndex=spokenAgendaNumber(match[1])-1;
    if(agendaIndex<0||agendaIndex>=AGENDA_DEFAULTS.length)continue;
    const start=match.index+match[0].length;
    const end=index+1<matches.length?matches[index+1].index:text.length;
    const section=text.slice(start,end).trim();
    if(!section)continue;
    let issues=grouped.get(agendaIndex);
    if(!issues){
      issues=readAgendaIssues(agendaIndex);
      for(const oldIssue of autoOrganizedIssues.get(agendaIndex)||[]){
        const oldIndex=issues.findIndex(issue=>issue.details===oldIssue.details&&issue.resolution===oldIssue.resolution);
        if(oldIndex>=0)issues.splice(oldIndex,1);
      }
      if(agendaIndex===3&&issues.every(issue=>!issue.resolution)&&issues.map(issue=>issue.details).join('\n')===AGENDA_DEFAULT_DETAILS[3])issues=[];
    }
    const routedIssues=splitAgendaSectionIssues(section);
    issues.push(...routedIssues);
    grouped.set(agendaIndex,issues);
    if(!routed.has(agendaIndex))routed.set(agendaIndex,[]);
    routed.get(agendaIndex).push(...routedIssues);
  }
  if(!grouped.size){toast('พบหัวข้อวาระ แต่ไม่มีเนื้อหาพอสำหรับจัดลงช่อง');return;}
  for(const [agendaIndex,issues] of grouped)renderAgendaIssueRows(agendaIndex,issues);
  for(const [agendaIndex,issues] of routed)autoOrganizedIssues.set(agendaIndex,issues);
  queueSaveAndPreview();
  $('generateStatus').textContent='จัดข้อความจากไฟล์ในเครื่องเข้าตามเลขวาระแล้ว '+grouped.size+' วาระ ตรวจทานและแยกประเด็นกับมติให้ตรงกันก่อนส่งออก';
  toast('จัดข้อความลงวาระแล้ว โปรดตรวจทานร่าง');
}
async function generateReport() {
  await organizeTranscriptIntoAgenda();
}

function reportBlocks(d){
  const out=[];const p=(text,style='Normal',align='left')=>out.push({kind:'p',text:String(text||''),style,align});
  const addAttendance=(heading,value)=>{p(heading,'Heading');const people=multiline(value);out.push({kind:'attendance',rows:people.length?people.map((person,i)=>{const [name,...role]=person.split(/\s+—\s+/u);return [thaiNumeral(i+1),name,role.join(' — ')];}):[['','................................................................','']]});};
  p('รายงานการประชุมคณะกรรมการบริหารโรงพยาบาลพรหมพิราม','Title','center');p(`${thaiNumeral(reportTitle(d))} ${d.meetingDate?`วันที่ ${thaiNumeral(formatMeetingDate(d.meetingDate))}`:'วันที่ ................................'}`,'Subtitle','center');p(`ณ ${d.location||'................................'}`,'Normal','center');
  addAttendance('ผู้เข้าร่วมประชุม',d.attendees);addAttendance('ผู้ไม่เข้าร่วมประชุม / ลา',d.absent);if(d.guests)addAttendance('ผู้เข้าร่วมประชุมเพิ่มเติม',d.guests);
  out.push({kind:'pageBreak'});p(`เปิดประชุมเวลา : ${thaiNumeral(formatMeetingTime(d.startTime)||'................')} น.`,'Opening');p('ก่อนวาระการประชุม','Heading');
  d.agenda.forEach((a,i)=>{p(thaiNumeral(a.title||AGENDA_DEFAULTS[i]),'Heading');const issues=getAgendaIssues(a,i);if(!issues.length){p('มติที่ประชุม : ........................................................','Decision');return;}issues.forEach((issue,index)=>{const label=agendaIssueLabel(issue,index);if(label)p(label,'IssueHeading');if(issue.details)multiline(issue.details).forEach(line=>p(line));const resolutions=multiline(issue.resolution);if(resolutions.length)resolutions.forEach((line,j)=>p(`${j?'':'มติที่ประชุม : '}${line}`,'Decision'));else p('มติที่ประชุม : ........................................................','Decision');});});
  if(d.actions.length)out.push({kind:'table',rows:[['เรื่อง / งาน','ผู้รับผิดชอบ','ระยะเวลาดำเนินการ'],...d.actions.map(a=>[a.topic,a.owner,a.due])]});
  p(`ปิดประชุมเวลา : ${thaiNumeral(formatMeetingTime(d.endTime)||'................')} น.`,'Normal');p('','Normal');
  const addSignature=(name,position,label)=>{p(`ลงชื่อ .................................................... ${label}`,'Signature','center');p(`(${signatureDisplayName(name)||'................................'})`,'SignatureName','center');multiline(position).forEach(line=>p(line,'SignaturePosition','center'));};
  addSignature(d.recorder,d.recorderPosition,'ผู้บันทึกรายงานการประชุม');addSignature(d.reviewer,d.reviewerPosition,'ผู้ตรวจรายงานการประชุม');addSignature(d.chair,d.chairPosition,'ผู้รับรองรายงานการประชุม');return out;
}
function wordRun(text,bold=false,size=32){return `<w:r><w:rPr><w:rFonts w:ascii="TH Sarabun New" w:hAnsi="TH Sarabun New" w:eastAsia="TH Sarabun New"/><w:sz w:val="${size}"/>${bold?'<w:b/>':''}</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;}
function wordParagraph(item){const heading=item.style==='Heading',issueHeading=item.style==='IssueHeading',title=item.style==='Title',sub=item.style==='Subtitle',signature=item.style==='Signature',signatureName=item.style==='SignatureName',signaturePosition=item.style==='SignaturePosition',opening=item.style==='Opening';const size=title?36:sub?32:heading?32:issueHeading?28:signature||signaturePosition?28:30;const bold=title||sub||heading||issueHeading||opening;const align={left:'left',center:'center',right:'right'}[item.align]||'left';const after=heading?'75':issueHeading?'25':title?'40':signature||signatureName||signaturePosition?'0':opening?'100':'55';const before=opening?'100':signature?'230':issueHeading?'35':'0';return `<w:p><w:pPr><w:jc w:val="${align}"/><w:spacing w:before="${before}" w:after="${after}" w:line="320" w:lineRule="auto"/></w:pPr>${wordRun(item.text,bold,size)}</w:p>`;}
function wordPageBreak(){return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';}
function wordAttendanceTable(rows){const widths=[650,3650,5055],grid=`<w:tblGrid>${widths.map(w=>`<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>`,borders='<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>',trs=rows.map(row=>`<w:tr>${row.map((cell,i)=>`<w:tc><w:tcPr><w:tcW w:w="${widths[i]}" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="320" w:lineRule="auto"/></w:pPr>${wordRun(cell,false,29)}</w:p></w:tc>`).join('')}</w:tr>`).join('');return `<w:tbl><w:tblPr><w:tblW w:w="9355" w:type="dxa"/><w:tblLayout w:type="fixed"/>${borders}<w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/><w:top w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr>${grid}${trs}</w:tbl>`;}
function wordTable(rows){const borders='<w:tblBorders><w:top w:val="single" w:sz="5" w:color="87958C"/><w:left w:val="single" w:sz="5" w:color="87958C"/><w:bottom w:val="single" w:sz="5" w:color="87958C"/><w:right w:val="single" w:sz="5" w:color="87958C"/><w:insideH w:val="single" w:sz="4" w:color="AAB5AE"/><w:insideV w:val="single" w:sz="4" w:color="AAB5AE"/></w:tblBorders>';const widths=[4900,2600,1855];const grid=`<w:tblGrid>${widths.map(w=>`<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>`;const trs=rows.map((row,ri)=>`<w:tr>${row.map((cell,ci)=>`<w:tc><w:tcPr><w:tcW w:w="${widths[ci]}" w:type="dxa"/>${ri===0?'<w:shd w:fill="EAF1EC"/>':''}</w:tcPr><w:p><w:pPr><w:spacing w:after="20"/></w:pPr>${wordRun(cell,ri===0,ri===0?29:28)}</w:p></w:tc>`).join('')}</w:tr>`).join('');return `<w:tbl><w:tblPr><w:tblW w:w="9355" w:type="dxa"/><w:tblLayout w:type="fixed"/>${borders}</w:tblPr>${grid}${trs}</w:tbl>`;}
async function downloadDocx(){
  if(!window.JSZip){toast('ไม่พบตัวสร้าง Word');return;}const d=readForm(),zip=new JSZip();const body=reportBlocks(d).map(item=>item.kind==='table'?wordTable(item.rows):item.kind==='attendance'?wordAttendanceTable(item.rows):item.kind==='pageBreak'?wordPageBreak():wordParagraph(item)).join('');
  const documentXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1417" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>');
  zip.folder('_rels').file('.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.folder('word').file('document.xml',documentXml).file('styles.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="TH Sarabun New" w:hAnsi="TH Sarabun New" w:eastAsia="TH Sarabun New"/><w:lang w:val="th-TH"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>');
  const blob=await zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});downloadBlob(blob,`รายงานการประชุม_กกบ_${safeName(d.meetingNo||'ฉบับร่าง')}.docx`);toast('ดาวน์โหลดไฟล์ Word แล้ว');
}
function safeName(s){return String(s).replace(/[\\/:*?"<>|]/g,'_').replace(/\s+/g,'_');}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function savePdf(){renderPreview();if(!readForm().meetingNo&&!readForm().agenda.some(a=>a.details||a.resolution)){toast('กรอกรายละเอียดรายงานก่อนบันทึก PDF');return;}document.title=`รายงานการประชุม_กกบ_${safeName($('meetingNo').value||'ฉบับร่าง')}`;window.print();}

function init(){
  window.addEventListener('beforeunload', releaseFfmpegBlobAssets, { once: true });
  try{$('transcriptionMode').value=localStorage.getItem(TRANSCRIPTION_MODE_KEY)==='accurate'?'accurate':'fast';}catch{$('transcriptionMode').value='fast';}
  $('transcriptionMode').addEventListener('change',()=>{try{localStorage.setItem(TRANSCRIPTION_MODE_KEY,selectedTranscriptionMode());}catch{}});
  clearInputs();renderAgenda();drawActions();renderPreview();renderHistory();
  $('browseBtn').addEventListener('click',e=>{e.stopPropagation();$('fileInput').click();});$('dropZone').addEventListener('click',e=>{if(e.target.closest('button'))return;$('fileInput').click();});$('dropZone').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('fileInput').click();}});$('fileInput').addEventListener('change',e=>handleFiles(e.target.files));
  for(const event of ['dragenter','dragover'])$('dropZone').addEventListener(event,e=>{e.preventDefault();$('dropZone').classList.add('dragover');});for(const event of ['dragleave','drop'])$('dropZone').addEventListener(event,e=>{e.preventDefault();$('dropZone').classList.remove('dragover');});$('dropZone').addEventListener('drop',e=>handleFiles(e.dataTransfer.files));
  document.querySelectorAll('.form-card input:not(.roster-name):not(.roster-role),.form-card textarea:not(.agenda-details):not(.agenda-resolution)').forEach(x=>{x.addEventListener('input',queueSaveAndPreview);x.addEventListener('change',()=>{if(x.id==='meetingDate')updateMeetingDateDisplay();queueSaveAndPreview();});});
  document.querySelectorAll('[data-roster-add]').forEach(button=>button.addEventListener('click',()=>{addRosterRow(button.dataset.rosterAdd);queueSaveAndPreview();}));
  $('formCard').addEventListener('input',event=>{if(event.target.matches('.roster-name,.roster-role'))queueSaveAndPreview();});
  $('formCard').addEventListener('click',event=>{const button=event.target.closest('.roster-remove');if(!button)return;const body=button.closest('tbody'),key=body.id.replace(/Rows$/,'');button.closest('tr').remove();if(!body.rows.length)body.innerHTML=rosterRowHtml();refreshRosterNumbers(key);queueSaveAndPreview();});
  $('agendaList').addEventListener('input',event=>{if(event.target.matches('.agenda-details,.agenda-resolution,.agenda-subissue-details,.agenda-subissue-resolution'))queueSaveAndPreview();});
  $('agendaList').addEventListener('click',event=>{const addSub=event.target.closest('.agenda-subissue-add');if(addSub){const row=addSub.closest('.agenda-issue-row');addAgendaSubIssue(row);queueSaveAndPreview();return;}const removeSub=event.target.closest('.agenda-subissue-remove');if(removeSub){const row=removeSub.closest('.agenda-issue-row'),subIssue=removeSub.closest('.agenda-subissue-row');subIssue.remove();refreshAgendaSubIssueNumbers(row);queueSaveAndPreview();return;}const add=event.target.closest('[data-agenda-issue-add]');if(add){addAgendaIssue(Number(add.dataset.agendaIssueAdd));queueSaveAndPreview();return;}const remove=event.target.closest('.agenda-issue-remove');if(remove){const row=remove.closest('.agenda-issue-row'),index=Number(row.dataset.agendaIndex);row.remove();refreshAgendaIssueNumbers(index);queueSaveAndPreview();}});
  $('addActionBtn').addEventListener('click',()=>{$('actionRows').insertAdjacentHTML('beforeend',actionRowHtml());bindActionRows();updateEmptyActions();});$('organizeTranscriptBtn').addEventListener('click',organizeTranscriptIntoAgenda);$('generateBtn').addEventListener('click',generateReport);$('downloadDocxBtn').addEventListener('click',downloadDocx);$('downloadPdfBtn').addEventListener('click',savePdf);$('newReportBtn').addEventListener('click',newReport);
}
init();
