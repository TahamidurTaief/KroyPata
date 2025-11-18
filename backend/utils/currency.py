# Currency utilities for BDT (Bangladeshi Taka) - Backend
# This utility provides consistent currency formatting throughout the Django backend
# No currency conversion - amounts are already in BDT

from decimal import Decimal
from typing import Union

class BDTConfig:
    """BDT Currency Configuration"""
    SYMBOL = '৳'  # Bengali Taka symbol
    CODE = 'BDT'
    NAME = 'Bangladeshi Taka'
    DECIMAL_PLACES = 2
    THOUSANDS_SEPARATOR = ','
    DECIMAL_SEPARATOR = '.'
    SYMBOL_POSITION = 'before'  # 'before' or 'after'
    SPACE_AFTER_SYMBOL = False

def format_bdt(amount: Union[float, Decimal, str], 
               show_symbol: bool = True) -> str:
    """
    Format amount as BDT currency string
    
    Args:
        amount: Amount to format (already in BDT)
        show_symbol: Whether to show currency symbol
        
    Returns:
        Formatted currency string
    """
    try:
        bdt_amount = Decimal(str(amount)) if amount else Decimal('0')
        
        # Round to specified decimal places
        rounded_amount = bdt_amount.quantize(Decimal('0.01'))
        
        # Format with thousands separator
        amount_str = f"{rounded_amount:,.2f}"
        
        # Add currency symbol
        if show_symbol:
            space = ' ' if BDTConfig.SPACE_AFTER_SYMBOL else ''
            if BDTConfig.SYMBOL_POSITION == 'before':
                return f"{BDTConfig.SYMBOL}{space}{amount_str}"
            else:
                return f"{amount_str}{space}{BDTConfig.SYMBOL}"
        
        return amount_str
    except (ValueError, TypeError):
        return "৳0.00" if show_symbol else "0.00"

def format_shipping_cost(cost: Union[float, Decimal, str], 
                        is_free: bool = False) -> str:
    """
    Format shipping cost in BDT
    
    Args:
        cost: Shipping cost (already in BDT)
        is_free: Whether shipping is free
        
    Returns:
        Formatted shipping cost
    """
    if is_free or (cost and Decimal(str(cost)) == 0):
        return 'Free'
    
    return format_bdt(cost, True)

def format_discount(discount: Union[float, Decimal, str]) -> str:
    """
    Format discount in BDT with minus sign
    
    Args:
        discount: Discount amount (already in BDT)
        
    Returns:
        Formatted discount with minus sign
    """
    if not discount or Decimal(str(discount)) <= 0:
        return format_bdt(0)
    
    return f"-{format_bdt(discount, True)}"

def get_currency_info() -> dict:
    """
    Get currency configuration as dictionary
    
    Returns:
        Dictionary with currency configuration
    """
    return {
        'symbol': BDTConfig.SYMBOL,
        'code': BDTConfig.CODE,
        'name': BDTConfig.NAME,
        'decimal_places': BDTConfig.DECIMAL_PLACES,
        'thousands_separator': BDTConfig.THOUSANDS_SEPARATOR,
        'decimal_separator': BDTConfig.DECIMAL_SEPARATOR,
        'symbol_position': BDTConfig.SYMBOL_POSITION,
        'space_after_symbol': BDTConfig.SPACE_AFTER_SYMBOL
    }
