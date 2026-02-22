<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ToolController;
use App\Http\Controllers\Admin\LoanController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Petugas\LoanApprovalController;
use App\Http\Controllers\Petugas\ReturnController;
use App\Http\Controllers\Petugas\ReportController;
use App\Http\Controllers\Peminjam\CatalogController;
use App\Http\Controllers\Peminjam\LoanRequestController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    /*
    |----------------------------------------------------------------------
    | Admin Routes
    |----------------------------------------------------------------------
    */
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('tools', ToolController::class);
        Route::apiResource('loans', LoanController::class);
        Route::get('activity-logs', [ActivityLogController::class, 'index']);
        Route::get('activity-logs/{activityLog}', [ActivityLogController::class, 'show']);
    });

    /*
    |----------------------------------------------------------------------
    | Petugas Routes
    |----------------------------------------------------------------------
    */
    Route::middleware('role:petugas')->prefix('petugas')->group(function () {
        // Loan Approval
        Route::get('loans/pending', [LoanApprovalController::class, 'pending']);
        Route::patch('loans/{loan}/approve', [LoanApprovalController::class, 'approve']);
        Route::patch('loans/{loan}/reject', [LoanApprovalController::class, 'reject']);

        // Return Monitoring
        Route::get('returns/active', [ReturnController::class, 'activeLoans']);
        Route::patch('returns/{loan}/confirm', [ReturnController::class, 'confirmReturn']);

        // Reports
        Route::get('reports', [ReportController::class, 'index']);
    });

    /*
    |----------------------------------------------------------------------
    | Peminjam Routes
    |----------------------------------------------------------------------
    */
    Route::middleware('role:peminjam')->prefix('peminjam')->group(function () {
        // Catalog
        Route::get('catalog', [CatalogController::class, 'index']);
        Route::get('catalog/categories', [CatalogController::class, 'categories']);
        Route::get('catalog/{tool}', [CatalogController::class, 'show']);

        // Loan Requests
        Route::get('loans', [LoanRequestController::class, 'index']);
        Route::post('loans', [LoanRequestController::class, 'store']);
        Route::get('loans/{loan}', [LoanRequestController::class, 'show']);
        Route::patch('loans/{loan}/return', [LoanRequestController::class, 'triggerReturn']);
    });
});
