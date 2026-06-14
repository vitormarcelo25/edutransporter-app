package io.github.David_Rn01.API_OFC.dto;

import io.github.David_Rn01.API_OFC.model.Cidade;
import io.github.David_Rn01.API_OFC.model.Faculdade;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AlunoDTO {

    private String cpf;
    private String nome;
    private String numeroCelular;
    private String senha;
    private String nomeCidade;
    private String nomeEstado;
    private String nomeFaculdade;
}
