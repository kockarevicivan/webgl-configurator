<html lang="en">
    <head>
        {/* Meta */}
        <meta charset="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="viewport" content="initial-scale=1, maximum-scale=1" />

        <meta name="keywords" content="" />
        <meta name="description" content="" />
        <meta name="author" content="" />

        {/* Title */}
        <title>WebGL Product Configurator</title>

        {/* Styles */}
        <link rel="stylesheet" href="/css/style.css" />

        {/* Icon */}
        <link rel="icon" href="https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/WebGL_Logo.svg/2560px-WebGL_Logo.svg.png" />
    </head>

    <body className="main-layout" id="translate_body">
        {/* Render-dependent libraries */}
        <script src="https://kit.fontawesome.com/0d8c0f527b.js" crossorigin="anonymous" async ></script>
        
        {children}

        {/* Spinner */}
        <div className="spinner-container">
            <div class="spinner">
                <div class="double-bounce1"></div>
                <div class="double-bounce2"></div>
            </div>
        </div>

        {/* Render-independent libraries */}
        <script type="text/javascript" src="//code.jquery.com/jquery-1.11.0.min.js"></script>
        <script type="text/javascript" src="//code.jquery.com/jquery-migrate-1.2.1.min.js"></script>
    </body>
</html>
