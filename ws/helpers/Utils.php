<?php

class Utils {
    public static function formatDate($date) {
        $dt = new DateTime($date);
        return $dt->format('d/m/Y');
    }

    public static function anuiteConstante($capitalEmprunte, $tauxInteret, $totalMensualite) {
        $tauxInteret = $tauxInteret/12/100;
        return $capitalEmprunte * ($tauxInteret / (1 - pow(1 + $tauxInteret, -$totalMensualite)));
    }
}