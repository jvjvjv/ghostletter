<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Ghost Letter API') }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #09090b 0%, #fab422 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
        }

        .container {
            text-align: center;
            padding: 2rem;
        }

        .logo {
            width: 150px;
            height: 150px;
            margin: 0 auto 2rem;
            animation: float 3s ease-in-out infinite;
        }

        h1 {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 1rem;
            opacity: 0;
            animation: fadeIn 0.8s ease-in forwards;
        }

        .redirect-text {
            font-size: 1.25rem;
            opacity: 0;
            animation: fadeIn 0.8s ease-in 0.3s forwards;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .dots {
            display: inline-flex;
            gap: 0.25rem;
        }

        .dot {
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            animation: pulse 1.4s ease-in-out infinite;
        }

        .dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes float {

            0%,
            100% {
                transform: translateY(0px);
            }

            50% {
                transform: translateY(-20px);
            }
        }

        @keyframes fadeIn {
            to {
                opacity: 1;
            }
        }

        @keyframes pulse {

            0%,
            100% {
                opacity: 1;
                transform: scale(1);
            }

            50% {
                opacity: 0.3;
                transform: scale(0.8);
            }
        }

        @media (max-width: 640px) {
            .logo {
                width: 120px;
                height: 120px;
            }

            h1 {
                font-size: 1.5rem;
            }

            .redirect-text {
                font-size: 1rem;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <!-- Ghost body - white sheet with wavy bottom -->
                <path d="M 512 256
                        C 410 256, 256 358, 256 512
                        L 256 717
                        C 256 743, 282 768, 307 768
                        L 333 742
                        C 348 717, 369 717, 384 742
                        L 410 768
                        C 425 742, 446 742, 461 768
                        L 487 742
                        C 502 717, 523 717, 538 742
                        L 564 768
                        C 579 742, 600 742, 615 768
                        L 641 742
                        C 656 717, 677 717, 692 742
                        L 717 768
                        C 743 768, 768 743, 768 717
                        L 768 512
                        C 768 358, 614 256, 512 256 Z" fill="white" stroke="#e0e0e0" stroke-width="10" />
                <!-- Left eye -->
                <ellipse cx="410" cy="461" rx="61" ry="92" fill="#333333" />
                <ellipse cx="425" cy="446" rx="26" ry="36" fill="white" />
                <!-- Right eye -->
                <ellipse cx="614" cy="461" rx="61" ry="92" fill="#333333" />
                <ellipse cx="629" cy="446" rx="26" ry="36" fill="white" />
                <!-- Happy mouth -->
                <path d="M 435 563 Q 512 614, 589 563" stroke="#333333" stroke-width="15" fill="none"
                    stroke-linecap="round" />
                <!-- Blush marks -->
                <ellipse cx="333" cy="538" rx="41" ry="26" fill="#ffb3ba" opacity="0.5" />
                <ellipse cx="691" cy="538" rx="41" ry="26" fill="#ffb3ba" opacity="0.5" />
            </svg>
        </div>

        <h1>Ghost Letter API</h1>

        <div class="redirect-text">
            Redirecting
            <span class="dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </span>
        </div>
    </div>

    <script>
        // Redirect to frontend after 10 seconds
        setTimeout(function () {
            window.location.href = '{{ env('FRONTEND_URL', 'http://localhost:3000') }}';
        }, 6340);
    </script>
</body>

</html>
