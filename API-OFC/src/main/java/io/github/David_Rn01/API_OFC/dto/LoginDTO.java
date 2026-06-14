package io.github.David_Rn01.API_OFC.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class LoginDTO {

    private String cpf;
    private String senha;
}
