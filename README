# TIMO Submission Tracker

Chrome Extension · Version 1.1.5

## Mô tả dự án — Tiếng Việt (350 từ)

TIMO Submission Tracker là extension Chrome hỗ trợ theo dõi và cập nhật bài nộp của thí sinh trong kỳ thi TIMO trên Google Sheets. Dự án xuất phát từ công việc thực tế của người phụ trách điểm danh: phải dò từng số báo danh, kiểm tra bài đã nộp, sao chép nội dung dòng nguồn rồi chèn ghi chú vào danh sách theo dõi. Khi số lượng thí sinh tăng, quy trình này mất nhiều thời gian và dễ bỏ sót.

Extension đối chiếu số báo danh giữa sheet bài nộp và sheet điểm danh theo Zoom được chọn. Người dùng có thể chuyển giữa các Zoom mà không phải sửa mã nguồn. Danh sách kết quả hiển thị số báo danh, họ tên, thời gian nộp và liên kết đến dòng bài nộp. Những bài đã nộp trước lúc bật công cụ vẫn được đưa vào danh sách, giúp người phụ trách tiếp tục kiểm tra dù bắt đầu theo dõi muộn.

Khi phát hiện bài mới, extension hiển thị thông báo nhỏ trên trang web đang xem hoặc sử dụng thông báo hệ thống. Khi được cấp quyền chỉnh sửa, công cụ tự tìm cột “Nộp Bài”, điền chữ “x” vào ô của đúng thí sinh và thêm ghi chú vào chính ô đó. Nội dung ghi chú lấy từ toàn bộ hàng tương ứng bên sheet bài nộp, bao gồm giá trị ở các cột ẩn, tương đương thao tác sao chép hàng và chèn ghi chú bằng Shift+F2.

Dự án sử dụng JavaScript, Chrome Extension Manifest V3, Google Sheets API và OAuth để kết nối tài khoản Google. Công cụ hỗ trợ tự nhận diện tiêu đề cột và lựa chọn cột thủ công khi cấu trúc sheet thay đổi. Ghi chú có sẵn được giữ nguyên; số báo danh trùng nhiều dòng được chuyển sang kiểm tra thủ công. Mục tiêu của dự án là giảm thao tác lặp lại, hỗ trợ theo dõi bài nộp rõ ràng hơn và giúp người phụ trách dành thời gian cho việc kiểm tra kết quả.

## Project description — English (350 words)

TIMO Submission Tracker is a Chrome extension that supports candidate submission tracking and attendance updates during the TIMO examination using Google Sheets. The project was developed around a practical administrative task: checking individual candidate numbers, identifying completed submissions, copying source rows, and inserting notes into an attendance spreadsheet. As candidate numbers increase, this repetitive process becomes time consuming and makes it easier to overlook submissions.

The extension matches candidate numbers between a submission sheet and an attendance sheet for a selected Zoom group. Users can switch groups without modifying the source code. The resulting list displays candidate numbers, names, submission times, and links to the corresponding source rows. Candidate names come from attendance records. Submissions received before monitoring starts are also included, allowing coordinators to review existing work even when they enable the extension late.

When a new submission is detected, the extension displays a small notification on the active webpage or uses a system notification when necessary. With editing permission, it identifies the “Submission” column, enters an “x” in the correct candidate’s cell, and adds a note to that same cell. The note contains the corresponding submission row, including displayed values from hidden columns. This reproduces the result of manually copying a row and inserting a cell note through Shift+F2.

The project uses JavaScript, Chrome Extension Manifest V3, Google Sheets API, and OAuth to connect a Google account. It supports automatic column detection and manual column selection when spreadsheet layouts differ. Existing notes are preserved, while candidate numbers appearing in multiple attendance rows are flagged for manual review. Failed updates can be retried without suppressing notifications about newly detected submissions.

The extension is intended to reduce repeated administrative work, make submission information easier to review, and give examination staff more time for checking results. It remains a supporting tool rather than a replacement for human review. Users retain responsibility for selecting the correct examination session, confirming spreadsheet permissions, and checking cases that require manual attention. Spreadsheet data is not sent to a separate private server, and automatic updates are limited to the configured attendance sheet and selected Zoom group.

---

## 1. Phạm vi và tính năng

- Phiên bản tài liệu: **1.1.5**, Chrome Extension Manifest V3, Chrome từ **120**.
- Chọn một Zoom để đối chiếu SBD; có thể đổi Zoom trên giao diện.
- Xem mọi bài khớp SBD của Zoom, gồm bài nộp trước khi bật.
- Hiện tên từ sheet điểm danh, thời gian nộp, trạng thái tự ghi và link dòng nguồn.
- Bài mới có thông báo mini trên trang đang xem; nếu không chèn được, dùng thông báo hệ thống.
- Tự điền chữ **`x`**, không phải tích checkbox thật, và thêm **NOTE** vào chính ô “Nộp Bài”. NOTE là ghi chú của Google Sheets, tương đương Shift+F2, không phải comment.
- Nội dung NOTE là giá trị hiển thị của toàn bộ hàng nguồn, gồm các cột ẩn, ngăn cách bằng tab. Không sao chép định dạng hoặc công thức.

## 2. Chuẩn bị hai sheet

| Sheet | Vai trò | Quyền tài khoản cần có |
|---|---|---|
| Sheet bài nộp, màu tím | Nguồn SBD và nội dung hàng bài nộp | Xem; phần đọc CSV cần quyền xuất dữ liệu |
| Sheet điểm danh | Danh sách SBD, Zoom, tên và ô “Nộp Bài” | Xem; tự ghi cần quyền chỉnh sửa ô đích |

Mở **đúng tab con** của từng file rồi copy link có `gid`. Quyền sửa cả file không đảm bảo sửa được ô đang được bảo vệ. Không cần công khai sheet.

Ví dụ cấu trúc đã dùng trong dự án, **không phải cấu trúc bắt buộc**:

| Trường cấu hình | Giá trị ví dụ |
|---|---|
| SBD sheet tím | `C` |
| Dòng tiêu đề sheet tím | `1` |
| SBD sheet điểm danh | `H` |
| Dòng tiêu đề sheet điểm danh | `1` |
| Cột Nộp Bài | `F` |
| Cột họ tên | `I` |
| Cột Zoom | `C` |
| Zoom cần theo dõi | `52` hoặc `48` |

Chữ cột là vị trí thật trong Sheets, kể cả khi có cột đang ẩn. Ví dụ A rồi C không có nghĩa C trở thành cột thứ hai.

## 3. Cài extension

1. Giải nén bản 1.1.5 thành thư mục `sbd-notifier-1.1.5`.
2. Tắt các bản SBD cũ để tránh chạy nhiều bản đồng thời.
3. Mở `chrome://extensions`, bật **Developer mode / Chế độ dành cho nhà phát triển**.
4. Chọn **Load unpacked / Tải tiện ích đã giải nén**, chọn thư mục chứa `manifest.json`.
5. Bấm biểu tượng extension để mở trang theo dõi.

Giữ thư mục cài ở vị trí ổn định. Sửa file xong phải bấm **Reload ↻** trên trang quản lý extension. Không chọn trực tiếp file ZIP khi Load unpacked.

## 4. Cấu hình Google để tự ghi

**Chỉ xem danh sách và thông báo:** không cần OAuth; bỏ chọn tự ghi.

**Tự điền x và NOTE:** thực hiện cấu hình sau một lần.

1. Vào [Google Cloud Console](https://console.cloud.google.com/), tạo hoặc chọn một project.
2. Trong **APIs & Services → Library**, tìm **Google Sheets API**, bấm **Enable**.
3. Mở **Google Auth Platform → Get started**. Điền tên app, email hỗ trợ và email liên hệ. Với Gmail cá nhân, chọn **External**.
4. Trong **Audience → Test users → Add users**, thêm email sẽ đăng nhập extension. Khi app ở Testing, email phải thuộc danh sách này.
5. Trong **Data Access → Add or remove scopes**, thêm scope:

   ```text
   https://www.googleapis.com/auth/spreadsheets
   ```

6. Trong **Clients → Create client**, chọn **Chrome Extension**. Điền tên và **Item ID** lấy từ `chrome://extensions`.
7. ID dự kiến của bản tự ghi này:

   ```text
   gheeppbbpojbcjijlpnlbjmonejdooek
   ```

   Kiểm tra ID thực tế phải khớp. Giữ nguyên trường `key` trong manifest.
8. Copy **Client ID**, mở `manifest.json` bằng trình soạn thảo, thay placeholder:

   ```json
   "client_id": "REPLACE_WITH_YOUR_CLIENT_ID.apps.googleusercontent.com"
   ```

   bằng Client ID thật, giữ nguyên dấu nháy và scope. Không dán Client Secret vào file.
9. Lưu, **Reload ↻** extension, mở giao diện và bấm **Kết nối Google để tự ghi**.
10. Đăng nhập tài khoản có quyền sửa sheet điểm danh và cấp quyền app đã cấu hình.

Nếu đã cấu hình OAuth cho bản tự ghi trước, có thể dùng lại Client ID khi ID extension vẫn khớp. Google Workspace có thể áp dụng chính sách riêng của tổ chức.

Tham khảo: [Chrome Extension OAuth](https://developer.chrome.com/docs/extensions/how-to/integrate/oauth), [Google OAuth consent](https://developers.google.com/workspace/guides/configure-oauth-consent).

## 5. Bắt đầu và đổi ca

1. Mở hai sheet trong cùng Chrome, bằng tài khoản có quyền truy cập.
2. Trong extension, nhập link đúng tab nguồn và tab điểm danh.
3. Nhập Zoom cần theo dõi; khớp chính xác, nên `48` không khớp `480`. Không dùng cột **ID ZOOM** thay cột Zoom.
4. Mở **Chọn cột thủ công** nếu cần, điền chữ cột và dòng tiêu đề.
5. Bật **Tự điền x và thêm ghi chú vào ô Nộp Bài** nếu đã cấp quyền.
6. Chọn hiển thị thông báo mini nếu muốn; Chrome sẽ hỏi quyền trang web.
7. Bấm **Lưu & bắt đầu ca mới**.
8. Kiểm tra trạng thái, danh sách đã nộp và cột **Tự ghi**. Ô cập nhật thành công hiển thị “Đã điền x + ghi chú”.

Đổi ca: cập nhật link đúng tab của ca mới và Zoom rồi lưu lại. Tên nút “ca mới” **không tự lọc theo ngày hoặc giờ thi**. Mọi bài còn trong tab nguồn và khớp SBD đều có thể được xử lý.

## 6. Quy tắc cập nhật

| Tình huống | Cách xử lý |
|---|---|
| Bài đã có trước khi bật | Vào danh sách; tự ghi nếu bật, không bật thông báo hàng loạt |
| Bài mới của Zoom đã chọn | Thêm danh sách, thông báo, thử tự ghi |
| SBD ngoài Zoom đã chọn | Không thông báo hoặc tự ghi |
| Một SBD có nhiều bài nguồn | Tự ghi dùng hàng xuất hiện cuối cùng trong tab nguồn |
| Ô đích trống, chưa có NOTE | Ghi x và NOTE trong cùng request |
| Ô có x nhưng chưa có NOTE | Thêm NOTE |
| Ô có x và NOTE khớp chính xác | Đánh dấu hoàn tất, không ghi lặp |
| Ô có NOTE khác hoặc có NOTE nhưng chưa có x | Giữ nguyên, đưa vào kiểm tra thủ công |
| SBD trùng nhiều hàng điểm danh | Bỏ qua, kể cả trùng ở Zoom khác |
| Ô có công thức, checkbox, data validation hoặc giá trị khác x | Bỏ qua và hiện lý do |
| Ghi thất bại | Hiện lỗi, thử lại lượt sau; bài mới vẫn được thông báo nếu đọc được dữ liệu |

Tối đa **40 ô mỗi lượt**. Bài nộp lại hoặc điểm được tính sau khi đã ghi NOTE có thể cần kiểm tra tay vì NOTE cũ không bị ghi đè. Hàng nguồn cuối cùng là theo vị trí sheet, không phải phép so sánh timestamp.

Danh sách phản ánh dữ liệu nguồn hiện tại; xóa bài nguồn có thể làm bài biến mất khỏi danh sách. Thao tác này không tự xóa x hoặc NOTE đã ghi ở sheet đích.

## 7. Tần suất và giới hạn

- Tab theo dõi mở: kiểm tra khoảng **5 giây/lần**; nền dùng alarm khoảng **30 giây/lần**.
- Đây là polling, không bảo đảm thông báo tức thời. Mạng chậm, đọc API lâu, tab ngủ hoặc Chrome hạn chế nền có thể gây trễ.
- Giữ hai tab sheet và tab theo dõi mở. Máy ngủ hoặc Chrome đóng thì ngừng theo dõi.
- Trang nội bộ Chrome hoặc một số trang khác không chèn được toast; notification hệ thống phụ thuộc cài đặt máy và chế độ Không làm phiền.
- **Không sắp xếp/chèn/xóa hàng khi đang tự ghi**, kể cả người cộng tác. Extension đọc lại trước khi ghi nhưng không khóa sheet; thay đổi đồng thời vẫn có thể làm lệch ô đích.
- Tạm dừng không hủy một request ghi đã gửi đi. Chờ lượt xử lý hiện tại kết thúc.

## 8. Chia sẻ cho người khác

Người quản lý app thêm email bạn vào **Test users** của đúng project. Gửi thư mục extension đã điền Client ID, giữ nguyên `key` và `client_id`. Người nhận không cần tạo project riêng nếu dùng cùng cấu hình.

Người nhận cài Load unpacked, đăng nhập Chrome, bấm Kết nối Google và cấp quyền. Tài khoản phải xem được nguồn và sửa được đích. Sau đó tự nhập link, Zoom và cột cho ca của mình. Thêm Test user không tự cấp quyền truy cập spreadsheet.

## 9. Xử lý lỗi

| Lỗi / biểu hiện | Kiểm tra |
|---|---|
| Chưa cấu hình OAuth Client ID | Thay placeholder trong manifest rồi Reload |
| Access blocked / 403, chỉ tester được truy cập | Thêm đúng email vào Audience → Test users trong project của Client ID |
| Không xác định được cột ZOOM | Chọn chữ cột thủ công; kiểm tra dòng tiêu đề; không dùng ID ZOOM |
| Không tìm thấy SBD hoặc Nộp Bài | Chọn cột/dòng tiêu đề thủ công, mở đúng tab |
| Không có SBD thuộc Zoom | Kiểm tra Zoom và dữ liệu cột Zoom |
| Không đọc được CSV | Mở sheet bằng đúng tài khoản; kiểm tra quyền xuất dữ liệu; bấm Kiểm tra ngay |
| 0 bài nộp | Có thể ca mới chưa có bài; đối chiếu với tab nguồn trước khi coi là lỗi |
| Google Sheets báo thiếu quyền | Kiểm tra tài khoản OAuth, quyền sửa và bảo vệ ô đích |
| Sheet thay đổi trong lúc đối chiếu | Dừng sắp xếp/chèn/xóa hàng, chờ lần kiểm tra tiếp theo |
| Đã có x nhưng chưa thấy NOTE | Xem cột Tự ghi, quyền API và mục Cần kiểm tra thủ công |
| Không có thông báo | Thử nút notification hệ thống, kiểm tra quyền trang web và cài đặt thông báo máy |

## 10. Công nghệ, quyền và dữ liệu

JavaScript, HTML/CSS, Manifest V3, Chrome Storage/Alarms/Notifications/Scripting/Identity và Google Sheets API. Đọc danh sách dùng CSV qua tab đăng nhập với đường dự phòng; tự ghi dùng OAuth và Sheets API.

Scope `spreadsheets` cho phép đọc/ghi các spreadsheet tài khoản có quyền, không chỉ riêng hai file đã nhập. Mã extension sử dụng hai sheet cấu hình và chỉ tự ghi ô Nộp Bài được xác định. Quyền trang web rộng là **tùy chọn**, phục vụ toast trên trang đang xem.

Cấu hình, danh sách SBD, tên và trạng thái được lưu cục bộ trong Chrome. Extension không có máy chủ riêng. NOTE đưa nội dung hàng nguồn, gồm đáp án nếu có, sang sheet điểm danh; người có quyền xem sheet đích có thể xem nội dung này. Không chia sẻ mật khẩu hoặc token. Có thể thu hồi quyền tại [Google Account Permissions](https://myaccount.google.com/permissions).

## 11. Cấu trúc mã nguồn và kiểm tra

| File | Vai trò |
|---|---|
| `manifest.json` | Phiên bản, quyền, OAuth và ID ổn định |
| `background.js` | Polling, đối chiếu, điều phối ghi và thông báo |
| `core.js` | Parse CSV, SBD, cột và lọc Zoom |
| `reader.js` | Đọc CSV qua tab Google Sheets / đường dự phòng |
| `list.js` | Danh sách đã nộp, tên và trạng thái bài có trước |
| `google.js` | Token OAuth, đọc dữ liệu và gọi Sheets API |
| `writer.js` | Lập kế hoạch x/NOTE và bảo vệ dữ liệu cũ |
| `monitor.html`, `monitor.js`, `style.css` | Giao diện cấu hình và theo dõi |

Đã kiểm tra bằng dữ liệu giả lập: lọc Zoom, bật muộn, tên, đúng ô đích, nội dung NOTE, bảo toàn ghi chú, SBD trùng và thử lại khi ghi lỗi. **Chưa xác nhận OAuth và thao tác trên sheet thật trong môi trường người dùng.** Trước khi dùng chính thức, thử trên bản sao hai sheet với một SBD, kiểm tra x và NOTE đúng ô, rồi kiểm tra tình huống ghi chú cũ và SBD trùng.

---

## English usage guide

### Requirements and installation

Use Chrome 120 or later. Extract version 1.1.5, disable older SBD extensions, enable Developer mode at `chrome://extensions`, and select **Load unpacked** for the folder containing `manifest.json`. Reload the extension after editing its files.

The source sheet requires viewing access and CSV export access for monitoring. The attendance sheet requires editing access for automatic updates, including access to the destination cells. Copy links from the correct spreadsheet tabs with their `gid` values. Hidden columns retain their original letters.

### Google configuration

Monitoring alone does not require OAuth; disable automatic writing. For automatic writing:

1. Create or select a Google Cloud project and enable **Google Sheets API**.
2. Configure **Google Auth Platform**, selecting External for a personal Gmail account.
3. Add the signing-in account under **Audience → Test users** while the app is in Testing.
4. Under **Data Access**, add `https://www.googleapis.com/auth/spreadsheets`.
5. Create a **Chrome Extension** OAuth client, using the installed extension ID as its Item ID.
6. Replace the placeholder `client_id` in `manifest.json`; preserve `key` and `scopes`.
7. Reload, click **Connect Google**, and authorize the account with the required sheet permissions.

The expected extension ID is `gheeppbbpojbcjijlpnlbjmonejdooek`; check the installed ID before creating the client. Organization policies may impose additional restrictions.

### Operation

Enter the source and attendance tab links, choose the Zoom group, and provide manual column settings if needed. Enable automatic writing and save the configuration. Keep both spreadsheet tabs and the monitoring page open.

Existing submissions appear immediately and may be written automatically; they do not trigger a burst of old-submission notifications. Newly detected submissions trigger notifications. Names come from the attendance sheet. The written result is a literal **x** and a **cell note in the same Submission cell**, not a checkbox or comment. The note contains the displayed source-row values, including hidden columns, separated by tabs. Formatting and formulas are not copied.

For repeated submissions, automatic writing selects the last matching source row by sheet position. Up to 40 cells are written per cycle. Existing matching x/note pairs are treated as complete. Other existing notes, formulas, validation rules, checkbox cells, conflicting values, and duplicate attendance candidate numbers are preserved or skipped for review. Failed writes are retried; new-submission notifications continue when monitoring reads succeed.

### Sessions, sharing and limitations

Changing the session requires selecting the correct source tab and Zoom group and saving again. The extension does not automatically filter by examination date. Deleting a source entry can remove it from the displayed list but does not clear previously written destination cells.

Monitoring uses polling: approximately five seconds with the monitor page open and thirty seconds through background alarms, with possible delays. It stops when Chrome closes or the computer sleeps. System notifications depend on operating-system settings.

Avoid sorting, inserting, or deleting attendance rows during automatic writing, including changes by collaborators. A reread checks for changes before writing, but the extension cannot lock the sheet or prevent simultaneous changes. Pausing does not cancel a request already sent.

To share, provide the configured extension folder with the same key and client ID, add the recipient as a Test user, and ensure their account has the required spreadsheet permissions. They install it, connect their own account, and configure their links and Zoom. Test-user membership does not grant spreadsheet access.

### Troubleshooting and privacy

For a missing Client ID, edit the manifest and reload. For tester-only 403 errors, add the exact signing-in email to the correct project's Test users. For column errors, select the real column letters and header row. For CSV failures, open the sheets using the authorized account and check export access. For write failures, check OAuth, edit access, cell protections, and the manual-review list.

The Sheets scope grants access to spreadsheets the account can access; extension code uses the configured files. Optional webpage permissions support toast notifications. Configuration, candidate names, submission lists, and statuses are stored locally. No separate private server receives sheet data. Source-row contents copied into notes become visible to users with access to the attendance sheet. Google access can be revoked through account permissions.

JavaScript modules separate monitoring, CSV reading, list building, OAuth calls, and write planning. Verification has used simulated data, not the user's live OAuth and spreadsheet environment. Test a copied pair of sheets before operational use.
