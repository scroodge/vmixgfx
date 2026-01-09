# Building Windows Executable

**Version: 0.1a (Alpha)**

This guide explains how to build a single Windows executable file (.exe) that contains all services (backend server and frontend files). Users can simply double-click the .exe file to start everything.

## Prerequisites

- **Windows 10/11** (64-bit recommended)
- **Python 3.8 or higher** installed from [python.org](https://www.python.org/)
- **Internet connection** (for downloading dependencies during build)

## Quick Start

### Option 1: Using Batch Script (Recommended)

1. Open **Command Prompt** or **PowerShell** in the project root directory
2. Double-click `build_windows.bat` or run:
   ```cmd
   build_windows.bat
   ```
3. Wait for the build to complete (this may take 5-10 minutes)
4. Find the executable at: `backend\dist\vmix_score_control.exe`

### Option 2: Using PowerShell Script

1. Open **PowerShell** in the project root directory
2. If you get an execution policy error, run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Run the build script:
   ```powershell
   .\build_windows.ps1
   ```
4. Wait for the build to complete
5. Find the executable at: `backend\dist\vmix_score_control.exe`

### Option 3: Manual Build

1. Open **Command Prompt** or **PowerShell** in the `backend` directory
2. Create and activate virtual environment:
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```cmd
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
4. Build the executable:
   ```cmd
   pyinstaller --clean vmix_score_control.spec
   ```
5. Find the executable at: `dist\vmix_score_control.exe`

## Using the Executable

### Running the Application

1. **Copy** `vmix_score_control.exe` to any Windows machine (no Python installation needed)
2. **Double-click** the executable to start the server
3. A console window will appear showing server status
4. The server will start on `http://localhost:8000`

### Accessing the Application

- **Control Panel**: Open your browser and go to `http://localhost:8000/control`
- **Overlay**: Open your browser and go to `http://localhost:8000/overlay?matchId=1`

### Network Access

The server binds to `0.0.0.0:8000` by default, which means:
- **Local access**: Use `localhost` or `127.0.0.1`
- **LAN access**: Use the machine's IP address (e.g., `http://192.168.1.100:8000/control`)
- **Firewall**: Windows Firewall may prompt you to allow the connection on first run

### Stopping the Application

- Click the **X** button on the console window, or
- Press `Ctrl+C` in the console window

## Build Configuration

### PyInstaller Spec File

The build process uses `backend/vmix_score_control.spec` which configures:
- **Entry point**: `main.py`
- **Frontend files**: All HTML, CSS, and JavaScript files are bundled
- **Python dependencies**: FastAPI, Uvicorn, WebSockets, etc.
- **Output**: Single-file executable (all-in-one)

### Customization

#### Hide Console Window

If you want to hide the console window, edit `backend/vmix_score_control.spec` and change:
```python
console=True,  # Change to False
```

#### Add Application Icon

1. Create or obtain a `.ico` file (e.g., `icon.ico`)
2. Place it in the `backend` directory
3. Edit `backend/vmix_score_control.spec` and change:
   ```python
   icon=None,  # Change to 'icon.ico'
   ```

#### Change Executable Name

Edit `backend/vmix_score_control.spec` and change:
```python
name='vmix_score_control',  # Change to your desired name
```

## File Size

The executable will be approximately:
- **100-150 MB** (depending on dependencies)
- This is normal for PyInstaller bundles that include Python runtime

## Troubleshooting

### Build Errors

#### "Python is not found"
- Install Python from [python.org](https://www.python.org/)
- Make sure Python is added to PATH during installation
- Restart your terminal/command prompt after installation

#### "pip is not recognized"
- Update pip: `python -m pip install --upgrade pip`
- Use: `python -m pip install -r requirements.txt`

#### "PyInstaller not found"
- Make sure you've installed dependencies: `pip install -r requirements.txt`
- Check that `pyinstaller` is in `requirements.txt`

#### "Module not found" errors during build
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Try cleaning and rebuilding: `pyinstaller --clean vmix_score_control.spec`

#### Build takes too long or hangs
- This is normal for first-time builds (5-15 minutes)
- Ensure stable internet connection for dependency downloads
- Close other applications to free up system resources

### Runtime Errors

#### "Port 8000 already in use"
- Another instance of the server may be running
- Close any existing instances
- Or change the port in the code before building

#### "Frontend files not found"
- Make sure the spec file includes all frontend files
- Check that file paths in the spec file are correct

#### Executable won't start
- Try running from Command Prompt to see error messages
- Check Windows Event Viewer for system errors
- Ensure you're on a compatible Windows version (Windows 7+)

#### Antivirus blocks the executable
- This is common for PyInstaller executables
- Add the executable to your antivirus exclusion list
- Or sign the executable with a code signing certificate

## Distribution

### Distributing the Executable

1. **Test thoroughly** on a clean Windows machine without Python installed
2. **Create a zip file** containing:
   - `vmix_score_control.exe`
   - `README.txt` (brief instructions)
3. **Optional**: Create an installer using tools like:
   - Inno Setup (free)
   - NSIS (free)
   - WiX Toolset (free, open-source)

### Installation Instructions for End Users

Include these instructions with the executable:

```
vMix Score Control - Installation Instructions
==============================================

1. Extract vmix_score_control.exe to any folder
2. Double-click vmix_score_control.exe to start
3. Open your browser and go to: http://localhost:8000/control
4. For vMix overlay: http://localhost:8000/overlay?matchId=1

Note: Windows Firewall may ask for permission on first run.

To stop the server, close the console window or press Ctrl+C.
```

## Advanced: Building with Different Options

### Debug Build (with console for troubleshooting)

The current spec file has `console=True` which shows the console window. This is useful for debugging.

### Release Build (without console)

Change `console=False` in the spec file to hide the console window. You'll need to create a log file if you want to capture output.

### One-Folder vs One-File

The current spec creates a **one-file** executable (everything bundled). If you want a **one-folder** build (faster startup, but multiple files), modify the spec file or use:

```cmd
pyinstaller --onedir vmix_score_control.spec
```

## Building on Other Platforms

While this guide focuses on Windows, you can build executables for other platforms:

- **Linux**: Similar process, but output will be a binary (no .exe extension)
- **macOS**: Similar process, output will be an .app bundle or binary

Note: PyInstaller builds are platform-specific. Build on the target platform or use cross-compilation tools.

## Updating the Executable

When you make changes to the code:

1. Make your code changes
2. Test in development mode first
3. Rebuild the executable using the same build process
4. Test the new executable thoroughly before distributing

## Support

For issues or questions:
1. Check the build logs for specific errors
2. Review the troubleshooting section above
3. Check PyInstaller documentation: https://pyinstaller.org/

---

**Note**: The first build may take longer as it downloads and packages all dependencies. Subsequent builds will be faster if dependencies haven't changed.

---

# Беларуская мова (Belarusian) / Беларуская мова

**Версія: 0.1a (Альфа)**

## Стварэнне выканальнага файла для Windows

Гэты даведнік тлумачыць, як стварыць адзін выканальны файл Windows (.exe), які змяшчае ўсе службы (бэкэнд сервер і фронтэнд файлы). Карыстальнікі могуць проста двойчы націснуць файл .exe для запуску ўсяго.

## Патрабаванні

- **Windows 10/11** (рэкамендуецца 64-бітная)
- **Python 3.8 або вышэй** усталяваны з [python.org](https://www.python.org/)
- **Інтэрнэт-падключэнне** (для спампоўкі залежнасцей падчас зборкі)

## Хуткі старт

### Варыянт 1: Выкарыстанне Batch скрыпта (Рэкамендуецца)

1. Адкрыйце **Command Prompt** або **PowerShell** у каталогу кораня праекта
2. Двойчы націсніце `build_windows.bat` або запусціце:
   ```cmd
   build_windows.bat
   ```
3. Пачакайце завяршэння зборкі (гэта можа заняць 5-10 хвілін)
4. Знайдзіце выканальны файл па адрасе: `backend\dist\vmix_score_control.exe`

### Варыянт 2: Выкарыстанне PowerShell скрыпта

1. Адкрыйце **PowerShell** у каталогу кораня праекта
2. Калі вы атрымаеце памылку палітыкі выканання, запусціце:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Запусціце скрыпт зборкі:
   ```powershell
   .\build_windows.ps1
   ```
4. Пачакайце завяршэння зборкі
5. Знайдзіце выканальны файл па адрасе: `backend\dist\vmix_score_control.exe`

### Варыянт 3: Ручная зборка

1. Адкрыйце **Command Prompt** або **PowerShell** у каталогу `backend`
2. Стварыце і актывуйце віртуальнае асяроддзе:
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   ```
3. Усталюйце залежнасці:
   ```cmd
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
4. Стварыце выканальны файл:
   ```cmd
   pyinstaller --clean vmix_score_control.spec
   ```
5. Знайдзіце выканальны файл па адрасе: `dist\vmix_score_control.exe`

## Выкарыстанне выканальнага файла

### Запуск дадатка

1. **Скапіруйце** `vmix_score_control.exe` на любую машыну Windows (устаноўка Python не патрэбна)
2. **Двойчы націсніце** выканальны файл для запуску сервера
3. З'явіцца акно кансолі, якое паказвае статус сервера
4. Сервер запускаецца на `http://localhost:8000`

### Доступ да дадатка

- **Панэль кіравання**: Адкрыйце ваш браўзер і перайдзіце на `http://localhost:8000/control`
- **Оверлей**: Адкрыйце ваш браўзер і перайдзіце на `http://localhost:8000/overlay?matchId=1`

### Сеткавы доступ

Сервер прывязваецца да `0.0.0.0:8000` па змаўчанні, што азначае:
- **Лакальны доступ**: Выкарыстоўвайце `localhost` або `127.0.0.1`
- **Доступ па ЛАС**: Выкарыстоўвайце IP-адрас машыны (напрыклад, `http://192.168.1.100:8000/control`)
- **Файрвол**: Windows Firewall можа папрасіць дазвол на злучэнне пры першым запуску

### Спыненне дадатка

- Націсніце кнопку **X** на акне кансолі, або
- Націсніце `Ctrl+C` у акне кансолі

## Канфігурацыя зборкі

### Файл спецыфікацыі PyInstaller

Працэс зборкі выкарыстоўвае `backend/vmix_score_control.spec`, які наладжвае:
- **Кропка ўваходу**: `main.py`
- **Фронтэнд файлы**: Усе HTML, CSS і JavaScript файлы пакуюцца
- **Python залежнасці**: FastAPI, Uvicorn, WebSockets і г.д.
- **Вывад**: Адзінафайлавы выканальны файл (усё ў адным)

### Налада

#### Схаваць акно кансолі

Калі вы хочаце схаваць акно кансолі, адрэдагуйце `backend/vmix_score_control.spec` і змяніце:
```python
console=True,  # Змяніце на False
```

#### Дадаць іконку дадатка

1. Стварыце або атрымайце файл `.ico` (напрыклад, `icon.ico`)
2. Размясціце яго ў каталогу `backend`
3. Адрэдагуйце `backend/vmix_score_control.spec` і змяніце:
   ```python
   icon=None,  # Змяніце на 'icon.ico'
   ```

#### Змяніць імя выканальнага файла

Адрэдагуйце `backend/vmix_score_control.spec` і змяніце:
```python
name='vmix_score_control',  # Змяніце на ваша жаданае імя
```

## Памер файла

Выканальны файл будзе прыкладна:
- **100-150 МБ** (у залежнасці ад залежнасцей)
- Гэта нармальна для пакетаў PyInstaller, якія ўключаюць Python runtime

## Вырашэнне праблем

### Памылкі зборкі

#### "Python не знойдзены"
- Усталюйце Python з [python.org](https://www.python.org/)
- Пераканайцеся, што Python даданы ў PATH падчас устаноўкі
- Перазапусціце тэрмінал/каманднае акно пасля устаноўкі

#### "pip не распазнаны"
- Абнавіце pip: `python -m pip install --upgrade pip`
- Выкарыстоўвайце: `python -m pip install -r requirements.txt`

#### "PyInstaller не знойдзены"
- Пераканайцеся, што вы ўсталявалі залежнасці: `pip install -r requirements.txt`
- Праверце, што `pyinstaller` ёсць у `requirements.txt`

#### Памылкі "Модуль не знойдзены" падчас зборкі
- Праверце, што ўсе залежнасці ўсталяваны: `pip install -r requirements.txt`
- Паспрабуйце ачысціць і перасбіраць: `pyinstaller --clean vmix_score_control.spec`

#### Зборка займае занадта шмат часу або зависае
- Гэта нармальна для першай зборкі (5-15 хвілін)
- Забяспечце стабільнае інтэрнэт-падключэнне для спампоўкі залежнасцей
- Зачыніце іншыя дадаткі для вызвалення сістэмных рэсурсаў

### Памылкі працы

#### "Порт 8000 ужо выкарыстоўваецца"
- Іншы экзэмпляр сервера можа працаваць
- Зачыніце любыя існуючыя экзэмпляры
- Або змяніце порт у кодзе перад зборкай

#### "Фронтэнд файлы не знойдзены"
- Пераканайцеся, што файл спецыфікацыі ўключае ўсе фронтэнд файлы
- Праверце, што шляхі да файлаў у файле спецыфікацыі правільныя

#### Выканальны файл не запускаецца
- Паспрабуйце запускаць з Command Prompt, каб убачыць паведамленні пра памылкі
- Праверце Windows Event Viewer на сістэмныя памылкі
- Пераканайцеся, што вы на сумяшчальнай версіі Windows (Windows 7+)

#### Антывірус блакуе выканальны файл
- Гэта распаўсюджана для выканальных файлаў PyInstaller
- Дадайце выканальны файл у спіс выключэнняў вашага антывіруса
- Або падпішыце выканальны файл сертыфікатам падпісу кода

## Распаўсюджванне

### Распаўсюджванне выканальнага файла

1. **Тэсціруйце старанна** на чыстай машыне Windows без усталяванага Python
2. **Стварыце zip-файл**, які змяшчае:
   - `vmix_score_control.exe`
   - `README.txt` (кароткія інструкцыі)
3. **Апцыянальна**: Стварыце ўстаноўшчык, выкарыстоўваючы інструменты, такія як:
   - Inno Setup (бясплатна)
   - NSIS (бясплатна)
   - WiX Toolset (бясплатна, з адкрытым зыходным кодам)

### Інструкцыі па ўстаноўцы для канчатковых карыстальнікаў

Уключыце гэтыя інструкцыі з выканальным файлам:

```
vMix Score Control - Інструкцыі па ўстаноўцы
==============================================

1. Распакуйце vmix_score_control.exe ў любую папку
2. Двойчы націсніце vmix_score_control.exe для запуску
3. Адкрыйце ваш браўзер і перайдзіце на: http://localhost:8000/control
4. Для оверлея vMix: http://localhost:8000/overlay?matchId=1

Заўвага: Windows Firewall можа папрасіць дазвол пры першым запуску.

Для спынення сервера зачыніце акно кансолі або націсніце Ctrl+C.
```

## Прасунутае: Зборка з рознымі опцыямі

### Зборка адладкі (з кансоллю для вырашэння праблем)

Бягучы файл спецыфікацыі мае `console=True`, які паказвае акно кансолі. Гэта карысна для адладкі.

### Вытворчая зборка (без кансолі)

Змяніце `console=False` у файле спецыфікацыі, каб схаваць акно кансолі. Вам спатрэбіцца стварыць файл журнала, калі вы хочаце захаваць вывад.

### Аднапапкавае vs Аднафайлавае

Бягучая спецыфікацыя стварае **аднафайлавы** выканальны файл (усё пакована). Калі вы хочаце **аднапапкавую** зборку (хутчэйшы запуск, але некалькі файлаў), змяніце файл спецыфікацыі або выкарыстоўвайце:

```cmd
pyinstaller --onedir vmix_score_control.spec
```

## Зборка на іншых платформах

Хоць гэты даведнік сканцэнтраваны на Windows, вы можаце ствараць выканальныя файлы для іншых платформаў:

- **Linux**: Падобны працэс, але вывад будзе бінарным (без пашырэння .exe)
- **macOS**: Падобны працэс, вывад будзе пакетам .app або бінарным

Заўвага: Зборкі PyInstaller залежаць ад платформы. Збірайце на цэлевай платформе або выкарыстоўвайце інструменты крыжавай кампіляцыі.

## Абнаўленне выканальнага файла

Калі вы робіце змены ў кодзе:

1. Зрабіце змены ў кодзе
2. Тэсціруйце ў рэжыме распрацоўкі спачатку
3. Перасбірайце выканальны файл, выкарыстоўваючы той жа працэс зборкі
4. Тэсціруйце новы выканальны файл старанна перад распаўсюджваннем

## Падтрымка

Пры пытаннях або праблемах:
1. Праверце лагі зборкі на канкрэтныя памылкі
2. Праглядзіце раздзел вырашэння праблем вышэй
3. Праверце дакументацыю PyInstaller: https://pyinstaller.org/

---

**Заўвага**: Першая зборка можа заняць больш часу, бо яна спампоўвае і пакуюе ўсе залежнасці. Наступныя зборкі будуць хутчэй, калі залежнасці не змяніліся.
